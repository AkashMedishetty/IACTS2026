import QRCode from 'qrcode'

// Brand color
const BRAND_COLOR = '#A56C00'

/**
 * Clean, high-readability QR code generator in brand color
 */
export class QRCodeGenerator {
  /**
   * Generate a branded QR code as data URL
   */
  static async generateQRDataURL(data: string): Promise<string> {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: BRAND_COLOR,
        light: '#FFFFFF'
      }
    })
  }

  /**
   * Generate a branded QR code as PNG buffer
   */
  static async generateQRBuffer(data: string): Promise<Buffer> {
    return await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'M',
      type: 'png',
      width: 300,
      margin: 2,
      color: {
        dark: BRAND_COLOR,
        light: '#FFFFFF'
      }
    })
  }

  /**
   * Generate registration QR code as data URL
   */
  static async generateRegistrationQR(registrationData: {
    registrationId: string
    name: string
    email: string
    type: string
  }): Promise<string> {
    return await this.generateQRDataURL(registrationData.registrationId)
  }

  /**
   * Generate registration QR code as PNG buffer for email attachment
   */
  static async generateRegistrationQRBuffer(registrationData: {
    registrationId: string
    name: string
    email: string
    type: string
  }): Promise<Buffer> {
    return await this.generateQRBuffer(registrationData.registrationId)
  }

  /**
   * Generate simple registration ID QR code
   */
  static async generateSimpleRegistrationQR(registrationId: string): Promise<string> {
    return await this.generateQRDataURL(registrationId)
  }

  /**
   * Generate simple registration ID QR code as buffer
   */
  static async generateSimpleRegistrationQRBuffer(registrationId: string): Promise<Buffer> {
    return await this.generateQRBuffer(registrationId)
  }
}
