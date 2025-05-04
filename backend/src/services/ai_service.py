from typing import List, Dict, Any
import numpy as np
from src.extensions import AI_MODELS, db
from src.models.prompt_model import PromptModel

class AIService:
    def __init__(self):
        self.sbert = AI_MODELS["sbert"]
        self.genai = AI_MODELS["genai"]
        
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
        Chỉ trả về kết quả dưới dạng nội dung JSON hợp lệ. Không thêm giải thích hay văn bản khác.
        Sau đây là văn bản:
        """

    def process_prompt(self, prompt: str) -> PromptModel:
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
            print(f"Error processing prompt: {e}")
            return PromptModel()

    def get_embeddings(self, sentences: List[str]) -> np.ndarray:
        try:
            return self.sbert.encode(sentences)
        except Exception as e:
            print(f"Error getting embeddings: {e}")
            return np.array([])

    