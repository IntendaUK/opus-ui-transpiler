const trait = {
  "acceptPrps": {},
  "prps": {
    "scps": [
      {
        "triggers": [
          {
            "event": "onGlobalKeyDown",
            "match": [
              {
                "comment": "enter",
                "operator": "isEqual",
                "value": "((event.keyCode))",
                "compareValue": 13
              },
              {
                "operator": "isFalsy",
                "key": "vis"
              }
            ]
          }
        ],
        "actions": [
          {
            "type": "setState",
            "key": "vis",
            "value": true
          }
        ]
      },
      {
        "triggers": [
          {
            "event": "onGlobalKeyDown",
            "match": [
              {
                "comment": "esc",
                "operator": "isEqual",
                "value": "((event.keyCode))",
                "compareValue": 27
              },
              {
                "operator": "isTruthy",
                "key": "vis"
              }
            ]
          }
        ],
        "actions": [
          {
            "type": "setState",
            "key": "vis",
            "value": false
          }
        ]
      },
      {
        "triggers": [
          {
            "event": "onGlobalKeyDown",
            "match": [
              {
                "comment": "enter",
                "operator": "isEqual",
                "value": "((event.keyCode))",
                "compareValue": 13
              },
              {
                "operator": "isTruthy",
                "key": "vis"
              }
            ]
          }
        ],
        "actions": [
          {
            "type": "setState",
            "target": "||modal.btnOk||",
            "key": "clicked",
            "value": true
          }
        ]
      }
    ]
  }
};

export default trait;
