from ..interface.daoWorker import DAOWorker
from databases.domain.relationship import Relationship


class Neo4jWorker(DAOWorker):

    def __init__(self, dao):
        self.dao = dao

    def can_handle(self, event: str):
        return event in {
            "show_info",
            "create_rel",
            "find_rel",
            "delete_rel",
            "get_all_relationships"
        }

    def handle(self, event: str, data: dict = None):

        data = data or {}

        if event == "show_info":
            return self.dao.showinfo()

        elif event == "create_rel":
            return self._create_rel(data)

        elif event == "find_rel":
            return self._find_rel(data)

        elif event == "delete_rel":
            return self._delete_rel(data)

        elif event == "get_all_relationships":
            return self.dao.search(data or {})

        else:
            raise ValueError("Unknown event")

    # ========================
    # PRIVATE METHODS
    # ========================

    def _create_rel(self, data):
        self._validate(data, [
            "from_id", "to_id", "rel_type",
            "from_label", "to_label",
            "from_key", "to_key"
        ])

        rel = Relationship(
            ids=[data["from_id"], data["to_id"]],
            relationship=data["rel_type"],
            from_label=data["from_label"],
            to_label=data["to_label"],
            from_key=data["from_key"],
            to_key=data["to_key"],
            props=data.get("props", {})
        )

        return self.dao.create(rel)

    def _find_rel(self, data):
        # flexible search
        return self.dao.search(data)

    def _delete_rel(self, data):
        self._validate(data, [
            "from_id", "to_id", "rel_type",
            "from_label", "to_label",
            "from_key", "to_key"
        ])

        rel = Relationship(
            ids=[data["from_id"], data["to_id"]],
            relationship=data["rel_type"],
            from_label=data["from_label"],
            to_label=data["to_label"],
            from_key=data["from_key"],
            to_key=data["to_key"]
        )

        return self.dao.delete(rel)

    def _validate(self, data, required_fields):
        for field in required_fields:
            if field not in data or data[field] is None:
                raise ValueError(f"Missing required field: {field}")