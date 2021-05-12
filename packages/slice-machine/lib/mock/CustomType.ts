import faker from 'faker'
import * as Widgets from './misc/widgets'

import { CustomType } from '../models/common/CustomType'
import { Tab, TabsAsObject } from '../models/common/CustomType/tab'

import { handleFields } from './misc/handlers'
import { GroupFieldsAsArray } from 'lib/models/common/CustomType/group'

interface Mock {
  id: string
  uid: string | null
  type: string
  data: { [key: string]: unknown }
}

const fieldsHandler = handleFields(Widgets)

const groupHandler = (fields: GroupFieldsAsArray) => {
  const items = []
  const entries = fields.map(e => [e.key, e.value])
  for (let i = 0; i < Math.floor(Math.random() * 6) + 2; i++) {
    items.push(fieldsHandler(entries))
  }
  return items
}

const sliceZoneHandler = ({ value }: { value: any }) => {
  console.log('TODO: define type of value other than any', { value })
}

const createEmptyMock = (type: string) => ({
  id: faker.datatype.uuid(),
  uid: null,
  type,
  data: {}
})

export default async function MockCustomType(model: CustomType<TabsAsObject>) {
  const customTypeMock: Mock = createEmptyMock(model.id)
  const maybeUid = Object.entries(model.tabs).reduce((acc, curr) => {
    const maybeWidgetUid = Object.entries(curr[1]).find(([_, e]) => e.type === "UID")
    if (!acc && maybeWidgetUid) {
      return curr
    }
    return acc
  })

  if (maybeUid) {
    customTypeMock.uid = Widgets.UID.handleMockConfig()
  }

  for (let [, tab] of Object.entries(model.tabs)) {
    const { fields, groups, sliceZone } = Tab.organiseFields(tab)
    
    const mockedFields = fieldsHandler(fields.map(e => [e.key, e.value]))
    customTypeMock.data = {
      ...customTypeMock.data,
      ...mockedFields
    }
    groups.forEach(({ key, value }) => {
      const groupFields = groupHandler(value.fields)
      customTypeMock.data[key] = groupFields
    })

    if (sliceZone) {
      sliceZoneHandler(sliceZone)
    }
  }
  return customTypeMock
}