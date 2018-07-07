import './styles.css'

export default {
  name: 'test1',
  experimentID: 'testid',
  sections: 1,
  maxAge: 60,
  isEligible: ({ route }) => route.path !== '/foo',
  variants: [
    { weight: 0 },
    { weight: 1 },
    { weight: 1 }
  ]
}
