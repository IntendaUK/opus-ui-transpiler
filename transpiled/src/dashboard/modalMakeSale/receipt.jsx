const trait = {
  "acceptPrps": {},
  "type": "containerSimple",
  "prps": {
    "roundedBorders": true,
    "backgroundColor": "primaryOrange",
    "padding": true,
    "paddingSize": "smallPadding",
    "borderRadius": "12px"
  },
  "wgts": [
    {
      "relId": "receiptRepeater",
      "type": "repeater",
      "prps": {
        "staticData": [],
        "rowMda": {
          "type": "containerSimple",
          "prps": {
            "dir": "horizontal",
            "mainAxisAlign": "start",
            "crossAxisAlign": "center"
          },
          "wgts": [
            {
              "type": "label",
              "prps": {
                "cpt": "((rowData.itemName))",
                "fontSize": "18px",
                "color": "darkText",
                "width": "40%"
              }
            },
            {
              "type": "label",
              "prps": {
                "cpt": "@ ₱((rowData.itemPrice))",
                "fontSize": "18px",
                "color": "darkText",
                "flexSize": 1,
                "width": "20%"
              }
            },
            {
              "type": "label",
              "prps": {
                "cpt": "x ((rowData.itemQuantity))",
                "fontSize": "18px",
                "color": "darkText",
                "flexSize": 1,
                "width": "20%"
              }
            },
            {
              "type": "label",
              "prps": {
                "cpt": "= ₱((rowData.saleTotal))",
                "fontSize": "18px",
                "color": "darkText",
                "flexSize": 1,
                "width": "20%",
                "bold": true
              }
            }
          ]
        }
      }
    },
    {
      "type": "containerSimple",
      "prps": {
        "backgroundColor": "primaryTeal",
        "borderRadius": "12px",
        "height": "46px",
        "roundedBorders": true,
        "mainAxisAlign": "center",
        "crossAxisAlign": "center",
        "padding": true,
        "paddingSize": "0px smallPadding",
        "marginLeft": "auto",
        "marginTop": "12px"
      },
      "wgts": [
        {
          "type": "label",
          "prps": {
            "cpt": "Total Sales: ₱",
            "color": "accentLight",
            "fontSize": "24px",
            "flows": [
              {
                "from": "||modal.receiptRepeater||",
                "fromKey": "staticData",
                "toKey": "cpt",
                "mapFunctionString": "v => `Receipt Total: ₱${v.reduce( (p, n) => p + n.saleTotal, 0)}`"
              }
            ]
          }
        }
      ]
    }
  ]
};

export default trait;
