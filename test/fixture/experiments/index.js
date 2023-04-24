export default [
  {
    name: 'test1',
    isEligible: ({ route }) => route.path === '/',
    experimentID: 'id1',
    variants: [
      { weight: 100 },
      { weight: 0 }
    ],
    maxAge: 120
  },
  {
    name: 'test-evaluated-experimentID',
    isEligible: ({ route }) => route.path === '/test-evaluated-experimentID',
    experimentID: ({ route }) => route.query.id,
    variants: [
      { weight: 100 },
      { weight: 0 }
    ]
  }
]
