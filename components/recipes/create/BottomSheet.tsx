import BottomSheetNotFoundContent from '@/components/recipes/create/BottomSheetNotFoundContent'
import { Ingredient } from '@/types/types'
import BottomSheet from '@gorhom/bottom-sheet'
import React from 'react'
import { StyleSheet } from 'react-native'
import BottomSheetFoundContent from './BottomSheetFoundContent'

const BottomSheetComponent = ({ bottomSheetRef, found, scannedProduct, mappedIngredient, addIngredient, handleRecommendation, handleScanAgain }: {
  bottomSheetRef: React.RefObject<BottomSheet>,
  found: boolean,
  scannedProduct: any,
  mappedIngredient: Ingredient | null,
  addIngredient: (ingredient: Ingredient) => void,
  handleRecommendation: (product: Ingredient) => void,
  handleScanAgain: () => void
}) => {
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      style={styles.container}
      snapPoints={['45%']}
      enablePanDownToClose={true}
    >
      {
        found ? <BottomSheetFoundContent
          scannedProduct={scannedProduct}
          mappedIngredient={mappedIngredient}
          addIngredient={addIngredient}
          handleRecommendation={handleRecommendation}
          handleScanAgain={handleScanAgain} />
          : <BottomSheetNotFoundContent
            handleScanAgain={handleScanAgain}
          />
      }
    </BottomSheet>
  )
}

export default BottomSheetComponent

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

})