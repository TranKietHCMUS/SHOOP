class UserService:  
    def __init__(self, ai_service=None):
        self.ai_service = ai_service

    def get_similar_products(self, user_products):
        embeddings = self.ai_service.get_embeddings(user_products)
        results = self.ai_service.search_products(embeddings, user_products)
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

    def get_stores(self, products):
        stores = []

        """
        search stores that have products
        """

        return stores

    def processing(self, request):
        # print(request)
        prompt = request.get("prompt")
        expected_radius = request.get("expected_radius")
        user_location = request.get("user_location")

        # prompt = self.ai_service.prompt_formatting(prompt)
        prompt_instance = self.ai_service.process_prompt(prompt)
        items = prompt_instance.items
        if not items:
            raise ValueError("Error in prompting, prompt again")
        products = []
        quantity = []
        total_price = prompt_instance.total_price
        for item in items:
            products.append(item.get("product_name"))
            quantity.append((item.get("quantity"), item.get("unit")))
            
        similar_products = self.get_similar_products(products)
        stores = self.get_stores(similar_products)

        return products, similar_products, quantity, total_price, stores
