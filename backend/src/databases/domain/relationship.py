class Relationship:

    def __init__(self,
                 ids,
                 relationship,
                 from_label=None,
                 to_label=None,
                 from_key=None,
                 to_key=None,
                 props=None):

        self.ids          = ids
        self.relationship = relationship
        self.from_label   = from_label
        self.to_label     = to_label
        self.from_key     = from_key
        self.to_key       = to_key
        self.props        = props or {}

    def __str__(self):
        return (
            f"({self.from_label})-[{self.relationship}]->({self.to_label}) "
            f"| IDs: {self.ids} "
            f"| Props: {self.props}"
        )

    def __repr__(self):
        return self.__str__()