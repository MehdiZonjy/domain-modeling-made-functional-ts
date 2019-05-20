import {EmailAddress, VipStatus, ZipCode, USStateCode, String50} from './common/simple-types'
import {Option} from 'fp-ts/lib/Option'

export interface PersonalName {
  firstName: String50.String50
  lastName: String50.String50
}

export interface CustomerInfo {
  name: PersonalName
  emailAddress: EmailAddress.EmailAddress
  vipStatus: VipStatus.VipStatus
}

export interface Address {
  addressLine1: String50.String50
  addressLine2: Option<String50.String50>
  addressLine3: Option<String50.String50>
  addressLine4: Option<String50.String50>
  city: String50.String50
  zipCode: ZipCode.ZipCode
  state: USStateCode.UsStateCode
  country: String50.String50
}

export const createCustomerInfo = (name: PersonalName, emailAddress: EmailAddress.EmailAddress, vipStatus: VipStatus.VipStatus): CustomerInfo => ({
  name,
  emailAddress,
  vipStatus
})

export const createPersonalName = (firstName: String50.String50, lastName: String50.String50): PersonalName => ({
  firstName,
  lastName
})