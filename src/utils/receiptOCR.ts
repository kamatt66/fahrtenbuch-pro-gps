import Tesseract from 'tesseract.js';
import { toast } from 'sonner';

export interface ExtractedReceiptData {
  gasStation?: string;
  location?: string;
  date?: string;
  fuelType?: string;
  fuelAmount?: number;
  pricePerLiter?: number;
  totalAmount?: number;
  receiptNumber?: string;
}

export class ReceiptOCR {
  private static worker: Tesseract.Worker | null = null;

  private static async initWorker() {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker('deu', 1, {
        logger: m => console.log('OCR:', m)
      });
    }
    return this.worker;
  }

  static async extractTextFromImage(imageFile: File | Blob): Promise<string> {
    try {
      const worker = await this.initWorker();
      const { data: { text } } = await worker.recognize(imageFile);
      return text;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Fehler beim Lesen des Belegs');
    }
  }

  static async extractReceiptData(imageFile: File | Blob): Promise<ExtractedReceiptData> {
    try {
      toast.info('Tankbeleg wird gescannt...', { duration: 3000 });
      
      const text = await this.extractTextFromImage(imageFile);
      console.log('Extracted text:', text);
      
      const data = this.parseReceiptText(text);
      
      if (Object.keys(data).length > 0) {
        toast.success('Tankbeleg erfolgreich gescannt!');
      } else {
        toast.warning('Einige Daten konnten nicht erkannt werden');
      }
      
      return data;
    } catch (error) {
      console.error('Receipt extraction error:', error);
      toast.error('Fehler beim Scannen des Belegs');
      return {};
    }
  }

  private static parseReceiptText(text: string): ExtractedReceiptData {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const result: ExtractedReceiptData = {};

    // Common gas station names
    const gasStations = [
      'SHELL', 'ARAL', 'ESSO', 'BP', 'TOTAL', 'AGIP', 'OMV', 'JET', 'STAR',
      'TANKSTELLE', 'STATION', 'RAIFFEISEN', 'HEM', 'ORLEN'
    ];

    // Common fuel types
    const fuelTypes = [
      { pattern: /SUPER\s*E?10/i, type: 'E10' },
      { pattern: /SUPER\s*PLUS/i, type: 'Super Plus' },
      { pattern: /SUPER/i, type: 'Super' },
      { pattern: /DIESEL/i, type: 'Diesel' },
      { pattern: /BENZIN/i, type: 'Benzin' },
      { pattern: /ADBLUE/i, type: 'AdBlue' }
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toUpperCase();

      // Extract gas station name
      if (!result.gasStation) {
        for (const station of gasStations) {
          if (line.includes(station)) {
            result.gasStation = this.cleanText(lines[i]);
            break;
          }
        }
      }

      // Extract date (various formats)
      if (!result.date) {
        const dateMatch = line.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})/);
        if (dateMatch) {
          const [, day, month, year] = dateMatch;
          const fullYear = year.length === 2 ? `20${year}` : year;
          result.date = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }

      // Extract fuel type
      if (!result.fuelType) {
        for (const fuel of fuelTypes) {
          if (fuel.pattern.test(line)) {
            result.fuelType = fuel.type;
            break;
          }
        }
      }

      // Extract amounts and prices
      const numberMatches = line.match(/(\d+[,.]?\d*)/g);
      if (numberMatches && numberMatches.length > 0) {
        
        // Look for fuel amount (usually with L or Liter)
        if (!result.fuelAmount && (line.includes('L') || line.includes('LITER'))) {
          const amountMatch = line.match(/(\d+[,.]?\d*)\s*L/);
          if (amountMatch) {
            result.fuelAmount = parseFloat(amountMatch[1].replace(',', '.'));
          }
        }

        // Look for price per liter (usually with €/L or EUR/L)
        if (!result.pricePerLiter && (line.includes('€/L') || line.includes('EUR/L'))) {
          const priceMatch = line.match(/(\d+[,.]?\d*)\s*€?\/L/);
          if (priceMatch) {
            result.pricePerLiter = parseFloat(priceMatch[1].replace(',', '.'));
          }
        }

        // Look for total amount (usually the largest number with € or EUR)
        if (line.includes('€') || line.includes('EUR')) {
          const totalMatch = line.match(/(\d+[,.]?\d*)\s*€/);
          if (totalMatch) {
            const amount = parseFloat(totalMatch[1].replace(',', '.'));
            if (!result.totalAmount || amount > result.totalAmount) {
              result.totalAmount = amount;
            }
          }
        }
      }

      // Extract receipt number
      if (!result.receiptNumber) {
        const receiptMatch = line.match(/(?:BELEG|RECEIPT|NR\.?|NUMMER)\s*:?\s*([A-Z0-9\-]+)/i);
        if (receiptMatch) {
          result.receiptNumber = receiptMatch[1];
        }
      }

      // Extract location/address
      if (!result.location && i < 5) { // Usually in first few lines
        if (line.match(/\d{5}\s+[A-ZÄÖÜ]/)) { // German postal code + city
          result.location = this.cleanText(lines[i]);
        }
      }
    }

    // Calculate missing values
    if (result.fuelAmount && result.pricePerLiter && !result.totalAmount) {
      result.totalAmount = Math.round(result.fuelAmount * result.pricePerLiter * 100) / 100;
    }

    if (result.totalAmount && result.fuelAmount && !result.pricePerLiter) {
      result.pricePerLiter = Math.round((result.totalAmount / result.fuelAmount) * 1000) / 1000;
    }

    return result;
  }

  private static cleanText(text: string): string {
    return text.replace(/[^\w\s\-\.äöüÄÖÜß]/g, '').trim();
  }

  static async cleanup() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}