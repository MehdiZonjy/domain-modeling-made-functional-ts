import {String50} from './common/string50'
import {EmailAddress, VipStatus, ZipCode, USStateCode} from './common/simple-types'
import {Option} from 'fp-ts/lib/Option'

export interface PersonalName {
  firstName: String50
  lastName: String50
}

export interface CustomerInfo {
  name: PersonalName
  emailAddress: EmailAddress.EmailAddress
  vipStatus: VipStatus.VipStatus
}

export interface Address {
  addressLine1: String50
  addressLine2: Option<String50>
  addressLine3: Option<String50>
  addresSLine4: Option<String50>
  city: String50
  zipCode: ZipCode.ZipCode
  state: USStateCode.UsStateCode
  country: String50
}