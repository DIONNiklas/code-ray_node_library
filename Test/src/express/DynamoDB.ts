class DynamoDB {
    public getItem() {
        return {
            Table: "TestDB",
            Items: [
                {
                    ID: 2,
                    CITY: "Augsburg"
                },
                {
                    ID: 3,
                    CITY: "Ulm"
                },
                {
                    ID: 3,
                    CITY: "München"
                }
            ]
        }
    }
}

module.exports = DynamoDB;