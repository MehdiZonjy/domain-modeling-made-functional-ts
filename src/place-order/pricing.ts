import { PricingMethod, GetStandardPrices, GetPromotionPrices, GetPricingFunction, GetProductPrice } from "../internal-types";
import {isEmptyOrUndefined} from '../common/constrained-primitives'
import { PromitionCode, ProductCode } from "../common/simple-types";
import { left, right, Either } from "fp-ts/lib/Either";
export const createPricingMethod = (promotionCode: string): Either<string,PricingMethod> => {
  if (isEmptyOrUndefined(promotionCode)){
    return right({
      _tag: 'standard'
    })
  }

  return PromitionCode.createEither('PromotionCode', promotionCode).map( code => ({
    code: code,
    _tag: 'promoition'
  }))
}

export const getPricingFunction = (standardPrices: GetStandardPrices) => (promoPrices: GetPromotionPrices): GetPricingFunction => {
  const getStandardPrices: GetProductPrice = standardPrices()
  
  const getPromotionPrice = (code: PromitionCode.PromitionCode): GetProductPrice => {
    const getPromotionPrice = promoPrices(code)
    return (productCode: ProductCode.ProductCode) => 
      getPromotionPrice(productCode).getOrElseL(() => getStandardPrices(productCode))
  }

  return (pricingMethod: PricingMethod): GetProductPrice => {
    switch(pricingMethod._tag) {
      case 'promoition': return getPromotionPrice(pricingMethod.code)
      case 'standard': return getStandardPrices
    }
  }
}