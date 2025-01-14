import * as Widgets from '../lib/widgets'

const WidgetsTable = Object.entries(Widgets)

test.each(WidgetsTable)('%s: schema validates configuration', (name, widget) => {
  const { schema } = widget
  const tests = require(`./__mockData__/widgets/${name}`)
  Object.entries(tests).forEach(([testName, t]) => {
    const { err, res } = (() => {
      try {
        const res = schema.validateSync(t)
        return { res }
      } catch(err) {
        return { err }
      }
    })()
    
    if (err) {
      expect(t.__pass).toBe(false)
    } else {
      expect(t.__pass).toBe(true)
    }
  })
});

