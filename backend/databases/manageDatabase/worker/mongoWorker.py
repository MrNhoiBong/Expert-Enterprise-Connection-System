from ..interface.daoWorker import DAOWorker


class MongoWorker(DAOWorker):

    def __init__(self, dao):
        self.dao = dao

    def can_handle(self, event: str):
        return event in {
            "show_info",
            "get_all",
            "find",
            "search"
        }

    def handle(self, event: str, data: dict = None):

        data = data or {}

        if event == "show_info":
            return self.dao.showinfo()

        elif event == "get_all":
            return self.dao.show_collections()

        elif event == "find":
            return self.dao.find(
                data.get("collection"),
                data.get("id")
            )

        elif event == "search":
            return self.dao.search(
                data.get("collection"),
                data.get("criteria", {})
            )

        else:
            raise ValueError("Unknown event")