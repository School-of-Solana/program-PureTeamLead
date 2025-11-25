/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/subscription_chain.json`.
 */
export type SubscriptionChain = {
  "address": "8ZHxyWD1BV6qjBx3nk7DQJMuphC8GJpbRqaX85qC79AD",
  "metadata": {
    "name": "subscriptionChain",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "cancelSubscription",
      "discriminator": [
        60,
        139,
        189,
        242,
        191,
        208,
        143,
        18
      ],
      "accounts": [
        {
          "name": "subscriber",
          "writable": true,
          "signer": true,
          "relations": [
            "subscription"
          ]
        },
        {
          "name": "subscription",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  85,
                  66,
                  83,
                  67,
                  82,
                  73,
                  80,
                  84,
                  73,
                  79,
                  78,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "subscriber"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "createCreatorProfile",
      "discriminator": [
        139,
        244,
        127,
        145,
        95,
        172,
        140,
        154
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "monthlyPrice",
          "type": "u64"
        },
        {
          "name": "quartalPrice",
          "type": "u64"
        },
        {
          "name": "annualPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "extendSubscription",
      "discriminator": [
        47,
        230,
        116,
        118,
        171,
        228,
        24,
        46
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true
        },
        {
          "name": "subscriber",
          "writable": true,
          "signer": true,
          "relations": [
            "subscription"
          ]
        },
        {
          "name": "subscription",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  85,
                  66,
                  83,
                  67,
                  82,
                  73,
                  80,
                  84,
                  73,
                  79,
                  78,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "subscriber"
              }
            ]
          }
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "typ",
          "type": {
            "defined": {
              "name": "subscriptionType"
            }
          }
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [],
      "args": []
    },
    {
      "name": "pauseSubscription",
      "discriminator": [
        18,
        180,
        147,
        157,
        114,
        60,
        213,
        241
      ],
      "accounts": [
        {
          "name": "subscriber",
          "writable": true,
          "signer": true,
          "relations": [
            "subscription"
          ]
        },
        {
          "name": "subscription",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  85,
                  66,
                  83,
                  67,
                  82,
                  73,
                  80,
                  84,
                  73,
                  79,
                  78,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "subscriber"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "resumeSubscription",
      "discriminator": [
        122,
        92,
        183,
        0,
        139,
        188,
        185,
        71
      ],
      "accounts": [
        {
          "name": "subscriber",
          "writable": true,
          "signer": true,
          "relations": [
            "subscription"
          ]
        },
        {
          "name": "subscription",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  85,
                  66,
                  83,
                  67,
                  82,
                  73,
                  80,
                  84,
                  73,
                  79,
                  78,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "subscriber"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "subscription",
      "discriminator": [
        129,
        211,
        214,
        238,
        4,
        12,
        27,
        25
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "subscriber",
          "writable": true,
          "signer": true
        },
        {
          "name": "subscription",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  85,
                  66,
                  83,
                  67,
                  82,
                  73,
                  80,
                  84,
                  73,
                  79,
                  78,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "subscriber"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "typ",
          "type": {
            "defined": {
              "name": "subscriptionType"
            }
          }
        }
      ]
    },
    {
      "name": "updateCreatorPrice",
      "discriminator": [
        224,
        111,
        228,
        70,
        7,
        90,
        103,
        184
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "monthlyPrice",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "quartalPrice",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "annualPrice",
          "type": {
            "option": "u64"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "config",
      "discriminator": [
        155,
        12,
        170,
        224,
        30,
        250,
        204,
        130
      ]
    },
    {
      "name": "subscription",
      "discriminator": [
        64,
        7,
        26,
        135,
        102,
        132,
        98,
        33
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "priceTooLow",
      "msg": "Price is too low"
    },
    {
      "code": 6001,
      "name": "configAlreadyInitialized",
      "msg": "Config already initialized"
    },
    {
      "code": 6002,
      "name": "pausedSubscription",
      "msg": "Subscription paused"
    },
    {
      "code": 6003,
      "name": "alreadyPausedSubscription",
      "msg": "Subscription already paused"
    },
    {
      "code": 6004,
      "name": "expiredSubscription",
      "msg": "Subscription expired"
    },
    {
      "code": 6005,
      "name": "notPausedSubscription",
      "msg": "Subscription is not paused"
    },
    {
      "code": 6006,
      "name": "invalidCreator",
      "msg": "Invalid creator"
    }
  ],
  "types": [
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "monthPrice",
            "type": "u64"
          },
          {
            "name": "quartalPrice",
            "type": "u64"
          },
          {
            "name": "annualPrice",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "subscription",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "subscriber",
            "type": "pubkey"
          },
          {
            "name": "pausedAt",
            "type": "i64"
          },
          {
            "name": "typ",
            "type": {
              "defined": {
                "name": "subscriptionType"
              }
            }
          },
          {
            "name": "endTimestamp",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "subscriptionType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "month"
          },
          {
            "name": "quartal"
          },
          {
            "name": "annual"
          }
        ]
      }
    }
  ]
};
