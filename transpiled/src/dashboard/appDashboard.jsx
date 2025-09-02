import { Container, ContainerSimple, ExternalComponent } from '@intenda/opus-ui';
import { Image, Label } from '@intenda/opus-ui-components';

const Component = ExternalComponent(() => {
  return (
  <ContainerSimple
   prps={{
        "singlePage": true,
        "mainAxisAlign": "start",
        "crossAxisAlign": "center",
        "padding": true,
        "backgroundColor": "lightBackground"
      }}
>
    <ContainerSimple
     prps={{
            "crossAxisAlign": "center",
            "width": "100%"
          }}
>
      <Label
       prps={{
                "cpt": "Maya Bee Bites",
                "color": "primaryOrange",
                "fontSize": "72px",
                "bold": true
              }}
      />
      <Container
       prps={{
                "canClick": true,
                "height": "120px",
                "position": "absolute",
                "left": "0px",
                "top": "0px",
                "fireScript": {
                  "actions": [
                    {
                      "type": "setVariable",
                      "name": "temp",
                      "value": "{{eval.localStorage.removeItem('itemSales')}}"
                    }
                  ]
                }
              }}
>
        <Image
         prps={{
                    "value": "images/logo.png",
                    "imageHeight": "120px"
                  }}
        />
      </Container>
      <Label
       prps={{
                "cpt": "[point of sales]",
                "italic": true,
                "color": "primaryTeal",
                "marginTop": "12px",
                "fontSize": "18px"
              }}
      />
      <Child mda={
{
                "prps": {
                  "position": "absolute",
                  "right": "0px",
                  "top": "calc(50% - 20px)",
                  "transform": "translateY(-50%)"
                },
                "traits": [
                  {
                    "trait": "shared/button",
                    "traitPrps": {
                      "icon": "settings",
                      "color": "teal",
                      "fireScript": {
                        "actions": [
                          {
                            "type": "setState",
                            "target": "||modalConfigurePrices||",
                            "key": "vis",
                            "value": true
                          }
                        ]
                      }
                    }
                  }
                ]
              }
      } />
      <Child mda={
{
                "prps": {
                  "position": "absolute",
                  "right": "64px",
                  "top": "calc(50% - 20px)",
                  "transform": "translateY(-50%)"
                },
                "traits": [
                  {
                    "trait": "shared/button",
                    "traitPrps": {
                      "icon": "content_copy",
                      "color": "teal",
                      "fireScript": {
                        "actions": [
                          {
                            "type": "copyToClipboard",
                            "value": [
                              "{{eval.",
                              "  const itemSales = {{state.||dataManager||.dataSales}};",
                              "  const formattedSales = itemSales.map(sale => `${sale.itemName}\t${sale.itemPrice}\t${sale.itemQuantity}\t${sale.saleTotal}`).join('\\n');",
                              "  formattedSales;",
                              "}}"
                            ],
                            "inlineKeys": [
                              "value"
                            ]
                          },
                          {
                            "type": "showNotification",
                            "msg": "Sales copied to clipboard"
                          }
                        ]
                      }
                    }
                  }
                ]
              }
      } />
    </ContainerSimple>
    <Child mda={
{
            "traits": [
              {
                "trait": "salesView/index",
                "traitPrps": {}
              }
            ]
          }
    } />
    <ContainerSimple
     prps={{
            "marginTop": "36px",
            "height": "auto",
            "crossAxisAlign": "center",
            "mainAxisAlign": "space-between",
            "width": "100%",
            "dir": "horizontal"
          }}
>
      <Child mda={
{
                "traits": [
                  {
                    "trait": "shared/button",
                    "traitPrps": {
                      "icon": "add",
                      "cpt": "Make Sale",
                      "color": "teal",
                      "prpsContainer": {
                        "dir": "horizontal"
                      },
                      "fireScript": {
                        "actions": [
                          {
                            "type": "setState",
                            "target": "||modalMakeSale||",
                            "key": "vis",
                            "value": true
                          }
                        ]
                      }
                    }
                  }
                ]
              }
      } />
      <ContainerSimple
       prps={{
                "backgroundColor": "primaryTeal",
                "borderRadius": "12px",
                "height": "46px",
                "roundedBorders": true,
                "mainAxisAlign": "center",
                "crossAxisAlign": "center",
                "padding": true,
                "paddingSize": "0px smallPadding"
              }}
>
        <Label
         prps={{
                    "cpt": "Total Sales: ₱",
                    "color": "accentLight",
                    "fontSize": "24px",
                    "flows": [
                      {
                        "from": "||dataManager||",
                        "fromKey": "totalSales",
                        "toKey": "cpt",
                        "mapFunctionString": "v => `Total Sales: ₱${v}`"
                      }
                    ]
                  }}
        />
      </ContainerSimple>
    </ContainerSimple>
    <Child mda={
{
            "scope": "modalMakeSale",
            "traits": [
              {
                "trait": "modalMakeSale/index",
                "traitPrps": {}
              }
            ]
          }
    } />
    <Child mda={
{
            "scope": "modalConfigurePrices",
            "traits": [
              {
                "trait": "modalConfigurePrices",
                "traitPrps": {}
              }
            ]
          }
    } />
    <Child mda={
{
            "scope": "modalCapturePrice",
            "traits": [
              {
                "trait": "modalCapturePrice",
                "traitPrps": {}
              }
            ]
          }
    } />
    <Child mda={
{
            "scope": "dataManager",
            "traits": [
              {
                "trait": "dataManager/index",
                "traitPrps": {}
              }
            ]
          }
    } />
    <Child mda={
{
            "traits": [
              {
                "trait": "notifications/index",
                "traitPrps": {}
              }
            ]
          }
    } />
  </ContainerSimple>
  );
});

export default Component;
