const trait = {
  "acceptPrps": {},
  "traits": [
    {
      "trait": "shared/modal",
      "traitPrps": {
        "wgts": [
          {
            "type": "containerSimple",
            "prps": {
              "gap": "12px",
              "flex": true
            },
            "wgts": [
              {
                "type": "label",
                "prps": {
                  "color": "accentLight",
                  "fontSize": "36px",
                  "cpt": "Capture Item / Price"
                }
              },
              {
                "type": "containerSimple",
                "prps": {
                  "color": "red",
                  "dir": "horizontal",
                  "mainAxisAlign": "space-between",
                  "backgroundPosition": "",
                  "crossAxisAlign": "center",
                  "marginTop": "24px"
                },
                "wgts": [
                  {
                    "type": "label",
                    "prps": {
                      "cpt": "Item Name",
                      "color": "primaryYellow",
                      "width": "40%"
                    }
                  },
                  {
                    "relId": "itemName",
                    "type": "input",
                    "prps": {
                      "color": "secondaryYellow",
                      "placeholder": "Item Name...",
                      "width": "60%"
                    }
                  }
                ]
              },
              {
                "type": "containerSimple",
                "prps": {
                  "dir": "horizontal",
                  "mainAxisAlign": "space-between",
                  "backgroundPosition": "",
                  "crossAxisAlign": "center"
                },
                "wgts": [
                  {
                    "type": "label",
                    "prps": {
                      "cpt": "Item Price",
                      "color": "primaryYellow",
                      "width": "40%"
                    }
                  },
                  {
                    "relId": "itemPrice",
                    "type": "input",
                    "prps": {
                      "color": "secondaryYellow",
                      "placeholder": "Item Price...",
                      "width": "60%"
                    }
                  }
                ]
              }
            ]
          },
          {
            "type": "containerSimple",
            "prps": {
              "dir": "horizontal",
              "mainAxisAlign": "space-between",
              "crossAxisAlign": "center",
              "marginTop": "36px"
            },
            "wgts": [
              {
                "traits": [
                  {
                    "trait": "shared/button",
                    "traitPrps": {
                      "icon": "close",
                      "cpt": "Cancel",
                      "color": "teal",
                      "prpsContainer": {
                        "dir": "horizontal"
                      },
                      "fireScript": {
                        "actions": [
                          {
                            "type": "setState",
                            "target": "||modal||",
                            "key": "vis",
                            "value": false
                          }
                        ]
                      }
                    }
                  }
                ]
              },
              {
                "traits": [
                  {
                    "trait": "shared/button",
                    "traitPrps": {
                      "icon": "save",
                      "cpt": "Ok",
                      "color": "orange",
                      "prpsContainer": {
                        "dir": "horizontal"
                      },
                      "fireScript": {
                        "id": "sCP",
                        "actions": [
                          {
                            "type": "setState",
                            "target": "||dataManager||",
                            "key": "tCaptureItem",
                            "value": {
                              "itemName": "{{sCP.state.||modal.itemName||.value}}",
                              "itemPrice": "{{sCP.state.||modal.itemPrice||.value}}"
                            }
                          },
                          {
                            "type": "setState",
                            "target": "||modal||",
                            "key": "vis",
                            "value": false
                          }
                        ]
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  ]
};

export default trait;
