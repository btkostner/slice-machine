import { useContext, useEffect, useState } from 'react'
import { Box, Flex, Heading, Button } from 'theme-ui'
import { LibrariesContext } from '../../../../src/models/libraries/context'
import { SliceZoneAsArray } from '../../../../lib/models/common/CustomType/sliceZone'

import SliceState from '../../../models/ui/SliceState'
import LibraryState from '../../../models/ui/LibraryState'

import Form from './Form'

import DefaultList from './components/DefaultList'

const mapAvailableAndSharedSlices = (sliceZone: SliceZoneAsArray, libraries: ReadonlyArray<LibraryState>) => {
  const availableSlices: ReadonlyArray<SliceState> = libraries.reduce((acc, curr) => {
    return [...acc, ...curr.components.map(e => e[0])]
  }, [])
  const { slicesInSliceZone, notFound } : { slicesInSliceZone: ReadonlyArray<SliceState>, notFound: ReadonlyArray<{key: string}>} = sliceZone.value.reduce((acc, { key }) => {
    const maybeSliceState = availableSlices.find((state) => state.infos.meta.id === key)
    if (maybeSliceState) {
      return { ...acc, slicesInSliceZone: [...acc.slicesInSliceZone, maybeSliceState] }
    }
    return { ...acc, notFound: [...acc.notFound, { key }]}
  }, { slicesInSliceZone: [], notFound: [] })
  return { availableSlices, slicesInSliceZone, notFound }
}

const SliceZone = ({
  tabId,
  sliceZone,
  onSelectSharedSlices,
  onRemoveSharedSlice,
}: {
  tabId: string,
  sliceZone: SliceZoneAsArray,
  onSelectSharedSlices: Function,
  onRemoveSharedSlice: Function,
  onDelete: Function
}) => {
  const [formIsOpen, setFormIsOpen] = useState(false)
  const libraries = useContext(LibrariesContext)

  const { availableSlices, slicesInSliceZone, notFound } = mapAvailableAndSharedSlices(sliceZone, libraries)

  useEffect(() => {
    if (notFound?.length) {
      notFound.forEach(({ key }) => {
        onRemoveSharedSlice(key)
      })
    }
  }, [notFound])
  
  return (
    <Box my={3}>
      <Flex bg="ctHeader" sx={{ py:  2, px: 3, mb: 2, borderRadius: '6px', alignItems: 'center', justifyContent: 'space-between' }}>
        <Flex sx={{ alignItems: 'center' }}>
          <Heading as="h4">SliceZone</Heading>
          {/* Select the slices to use in this template */}
        </Flex>
        <Button onClick={() => setFormIsOpen(true)}>Edit slices</Button>
      </Flex>
      <DefaultList slices={slicesInSliceZone} />
      {
        !slicesInSliceZone.length ? (
          <p>no slices selected</p>
        ) : null
      }
      <Form
        isOpen={formIsOpen}
        formId={`tab-slicezone-form-${tabId}`}
        availableSlices={availableSlices}
        slicesInSliceZone={slicesInSliceZone}
        onSubmit={({ sliceKeys }: { sliceKeys: [string] }) => onSelectSharedSlices(sliceKeys)}
        close={() => setFormIsOpen(false)}
      />
    </Box>
  )
}

export default SliceZone