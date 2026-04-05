class Data:
    def __init__(self, id: str, data: dict):
        self.id = id
        self.data = data

    def __str__(self):
        return f"Data(id={self.id}, data={self.data})"