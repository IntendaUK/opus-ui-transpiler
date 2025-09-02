const trait = {
  "acceptPrps": {
    "prpsContainer": {
      "type": "object",
      "dft": {}
    },
    "wgts": {
      "dft": []
    },
    "wgtsToolbar": {
      "dft": []
    }
  },
  "scope": "modal",
  "type": "containerSimple",
  "container": "root",
  "prps": {
    "vis": false,
    "width": "100%",
    "height": "100%",
    "position": "absolute",
    "left": "0px",
    "top": "0px",
    "backgroundColor": "rgba(255, 255, 255, 0.1)",
    "backdropFilter": "blur(6px)",
    "mainAxisAlign": "center",
    "crossAxisAlign": "center",
    "zIndex": 2
  },
  "wgts": [
    {
      "type": "containerSimple",
      "prps": {
        "roundedBorders": true,
        "borderRadius": "12px",
        "backgroundColor": "accentDark",
        "padding": true,
        "paddingSize": "mediumPadding",
        "width": "50%",
        "height": "70%",
        "gap": "24px",
        "spread-": "$prpsContainer$"
      },
      "wgts": [
        {
          "type": "containerSimple",
          "prps": {
            "flex": true
          },
          "wgts": "$wgts$"
        },
        {
          "condition": {
            "operator": "isTruthy",
            "value": "$wgtsToolbar.length$"
          },
          "type": "containerSimple",
          "wgts": "$wgtsToolbar$"
        }
      ]
    }
  ]
};

export default trait;
