class Relationship:

    def __init__(self,
                 ids,
                 relationship,
                 from_label=None,
                 to_label=None,
                 from_key=None,
                 to_key=None,
                 props=None):

        self.ids = ids
        self.relationship = relationship
        self.from_label = from_label
        self.to_label = to_label
        self.from_key = from_key
        self.to_key = to_key
        self.props = props or {}