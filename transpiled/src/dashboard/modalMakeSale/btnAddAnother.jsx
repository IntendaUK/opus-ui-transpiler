const trait = {
  "acceptPrps": {},
  "traits": [
    {
      "trait": "shared/button",
      "traitPrps": {
        "icon": "add",
        "cpt": "Add Another",
        "color": "orange",
        "prpsContainer": {
          "dir": "horizontal"
        },
        "fireScript": {
          "id": "sMS",
          "actions": [
            {
              "type": "setState",
              "target": "||modal.receiptRepeater||",
              "key": "staticData",
              "value": [
                "{{eval.",
                "  const data = {{state.||modal.receiptRepeater||.staticData}};",
                "  data.push({",
                "    itemName: {{state.||modalMakeSale||.itemName}},",
                "    itemPrice: {{state.||modalMakeSale||.itemPrice}},",
                "    itemQuantity: {{state.||modalMakeSale||.itemQuantity}},",
                "    saleTotal: {{state.||modalMakeSale||.itemPrice}} * {{state.||modalMakeSale||.itemQuantity}}",
                "  });",
                "  data;",
                "}}"
              ],
              "inlineKeys": [
                "value"
              ]
            },
            {
              "type": "setMultiState",
              "target": "||modal.itemName||",
              "value": {
                "value": "",
                "selectedIndex": 0,
                "forceFocus": true,
                "triggerOpenLookup": true
              }
            },
            {
              "type": "setMultiState",
              "target": "||modal.itemQuantity||",
              "value": {
                "value": ""
              }
            }
          ]
        }
      }
    }
  ]
};

export default trait;
