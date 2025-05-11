from typing import List, Dict, Any, Union
import numpy as np
from src.extensions import AI_MODELS, db
from src.models.prompt_model import PromptModel
import math
import re
from collections import Counter
from src.config import Config
import logging

class AIService:
    def __init__(self):
        self.sbert = AI_MODELS["sbert"]
        self.genai = AI_MODELS["genai"]
        self.logger = logging.getLogger(__name__)
        
    def _get_system_prompt(self) -> str:
        return """
        You are an AI that strictly conforms to responses in JSON formatted strings that is valid when parsed by a JSON parser.
        - Do not use triple backticks (```), even if returning code or JSON.
        - Only output valid JSON with no formatting hints.
        - Your responses consist of valid JSON syntax, with no other comments, explainations, reasoninng, or dialogue not consisting of valid JSON.

        Hãy trích xuất thông tin từ bất kỳ văn bản nào được gửi tới, và trả về kết quả theo đúng định dạng JSON với các trường sau:
        - items: danh sách các sản phẩm, mỗi sản phẩm có các trường:
            - product_name: tên sản phẩm (là chuỗi)
            - quantity: số lượng (là số nguyên)
            - unit: đơn vị tính (là chuỗi)
        - total_price: tổng giá tiền (là số thực)
        Sản phẩm có thể là bất kì thứ gì đến từ siêu thị và cửa hàng tiện lợi, bao gồm thực phẩm, đồ uống, đồ dùng gia đình, đồ dùng cá nhân, và các sản phẩm khác.
        - Đơn vị tính có thể là: cái, chai, gói, hộp, túi, kg, lít, gam, ml, viên, gói, thùng, vỉ, khay.
        Nếu như không thể xác định được đơn vị tính, hãy trả về "cái".
        Nếu như không thể xác định được số lượng, hãy trả về 1.
        Nếu như không thể xác định được tổng giá tiền, hãy trả về 0.
        - Nếu như không thể xác định được tên sản phẩm, hãy trả về mảng rỗng [].
        Chỉ trả về kết quả dưới dạng nội dung JSON hợp lệ. Không thêm giải thích hay văn bản khác.
        Sau đây là văn bản:
        """

    def process_prompt(self, prompt: str) -> PromptModel:
        """Process a prompt and return a PromptModel object."""
        try:
            response = self.genai.models.generate_content(
                model="gemini-2.0-flash-lite", 
                contents=(self._get_system_prompt() + prompt)
            )
            raw_text = response.text.strip()
            if raw_text.startswith("```") and raw_text.endswith("```"):
                raw_text = "\n".join(raw_text.split("\n")[1:-1])
            return PromptModel.from_json(raw_text)
        except Exception as e:
            self.logger.error(f"Error processing prompt: {e}")
            return PromptModel()

    def get_embeddings(self, sentences: Union[List[str], str]) -> np.ndarray:
        """Get embeddings for a list of sentences or a single sentence."""
        try:
            if isinstance(sentences, str):
                sentences = [sentences]
            return self.sbert.encode(sentences)
        except Exception as e:
            self.logger.error(f"Error getting embeddings: {e}")
            return np.array([])
            
    def preprocess_text(self, text: str) -> List[str]:
        """Preprocess text: lower, tokenize, remove stop words."""
        if not text:
            return []
            
        text = text.lower()
        
        tokens = re.findall(r'\b\w+\b', text)
        
        vietnamese_stop_words = set([
            "và", "hoặc", "là", "của", "cho", "trong", "với", "các", "những", "này", 
            "có", "không", "được", "tại", "từ", "một", "để", "đến", "về", "như"
        ])
        
        tokens = [token for token in tokens if token not in vietnamese_stop_words]
        
        return tokens
        
    def bm25_score(self, query: str, document: str, k1: float = 1.5, b: float = 0.75) -> float:
        try:
            if not query or not document:
                return 0.0
                
            query_tokens = self.preprocess_text(query)
            doc_tokens = self.preprocess_text(document)
            
            if not query_tokens or not doc_tokens:
                return 0.0
                
            doc_term_freqs = Counter(doc_tokens)
            doc_length = len(doc_tokens)
            
            score = 0.0
            for term in query_tokens:
                if term in doc_term_freqs:
                    tf = doc_term_freqs[term]
                    
                    numerator = tf * (k1 + 1)
                    denominator = tf + k1
                    term_score = numerator / denominator
                    
                    score += term_score
                    
            if b > 0:
                avg_doc_length = 20 
                length_norm = 1 - b + b * (doc_length / avg_doc_length)
                score = score / length_norm if length_norm > 0 else score
                
            return score
            
        except Exception as e:
            self.logger.error(f"Error calculating BM25 score: {e}")
            return 0.0
            
    def okapi_bm25_score(self, query: str, document: str, k1: float = 1.5, 
                         b: float = 0.75, corpus_size: int = 100) -> float:
        try:
            if not query or not document:
                return 0.0
                
            query_tokens = self.preprocess_text(query)
            doc_tokens = self.preprocess_text(document)
            
            if not query_tokens or not doc_tokens:
                return 0.0
                
            doc_term_freqs = Counter(doc_tokens)
            doc_length = len(doc_tokens)
            
            simulated_doc_freq = {
                term: max(1, int(corpus_size * 0.1)) 
                for term in set(query_tokens)
            }
            
            score = 0.0
            
            avg_doc_length = 20  
            
            for term in query_tokens:
                if term in doc_term_freqs:
                    tf = doc_term_freqs[term]
                    
                    df = simulated_doc_freq.get(term, 1)
                    idf = math.log((corpus_size - df + 0.5) / (df + 0.5) + 1.0)
                    
                    tf_score = tf * (k1 + 1) / (tf + k1 * (1 - b + b * doc_length / avg_doc_length))
                    term_score = idf * tf_score
                    
                    score += term_score
                    
            return score
            
        except Exception as e:
            self.logger.error(f"Error calculating Okapi BM25 score: {e}")
            return 0.0
            
    def unit_similarity_score(self, query_unit: str, product_unit: str) -> float:
        try:
            if not query_unit or not product_unit:
                return 0.0
                
            query_unit = query_unit.lower()
            product_unit = product_unit.lower()
            
            if query_unit == product_unit:
                return 1.0
                
            if query_unit in product_unit or product_unit in query_unit:
                return 0.7
                
            unit_variations = Config.UNIT_VARIATIONS
            
            for base_unit, variations in unit_variations.items():
                if (query_unit == base_unit and product_unit in variations) or \
                   (product_unit == base_unit and query_unit in variations):
                    return 0.8
                
                if query_unit in variations and product_unit in variations:
                    return 0.7
            
            common_chars = set(query_unit) & set(product_unit)
            max_len = max(len(query_unit), len(product_unit))
            if max_len > 0:
                similarity = len(common_chars) / max_len
                if similarity > 0.5:  
                    return 0.5 * similarity
            
            return 0.1  
            
        except Exception as e:
            self.logger.error(f"Error calculating unit similarity: {e}")
            return 0.0

