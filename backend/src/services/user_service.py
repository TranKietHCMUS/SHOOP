from src.services.ai_service import prompt_formatting, search_products
from src.extensions import AI_MODELS

sbert = AI_MODELS["sbert"]

def get_similar_products(user_products):
    embeddings = sbert.encode(user_products)
    results = search_products(embeddings, user_products)
    final_results = []
    for i, res in enumerate(results):
        product_res = []
        for j, result in enumerate(res):
            product_res.append({
                "id": str(result['_id']),
                "name": result['name'],
                "score": result['score'],
                "created_at": result['created_at'],
                "updated_at": result['updated_at'],
            })
        final_results.append(product_res)
    return final_results

def get_stores(products):
    stores = []

    """
    search stores that have products
    """

    return stores

def processing(prompt):
    if not prompt:
        raise ValueError("Prompt is empty")
    prompt = prompt_formatting(prompt)
    items = prompt['items']
    if not items:
        raise ValueError("Error in prompting, prompt again")
    products = []
    quantity = []
    total_price = prompt['total_price']
    for item in items:
        products.append(item.get("product_name"))
        quantity.append((item.get("quantity"), item.get("unit")))
        
    similar_products = get_similar_products(products)
    stores = get_stores(similar_products)

    return products, similar_products, quantity, total_price, stores
