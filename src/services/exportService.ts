import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { VisitingCard } from '../types/card';

export const exportService = {
  /**
   * Transforms VisitingCard list to flat data rows suitable for Excel / CSV export.
   */
  prepareExportRows(cards: VisitingCard[]) {
    return cards.map((card) => {
      const phones = card.phoneNumbers || [];
      const emails = card.emailAddresses || [];
      const websites = card.websites || [];

      const phone1 = phones[0] || '';
      const phone2 = phones[1] || '';
      const phone3 = phones[2] || '';
      const phone4 = phones[3] || '';
      const phone5 = phones[4] || '';
      const additionalPhones = phones.length > 5 ? phones.slice(5).join('; ') : '';

      const email1 = emails[0] || '';
      const email2 = emails[1] || '';
      const email3 = emails[2] || '';
      const email4 = emails[3] || '';
      const email5 = emails[4] || '';
      const additionalEmails = emails.length > 5 ? emails.slice(5).join('; ') : '';

      const website1 = websites[0] || '';
      const website2 = websites[1] || '';
      const additionalWebsites = websites.length > 2 ? websites.slice(2).join('; ') : '';

      const linkedIn = card.socialLinks?.find((s) => s.platform.toLowerCase().includes('linkedin'))?.url || '';
      const instagram = card.socialLinks?.find((s) => s.platform.toLowerCase().includes('instagram'))?.url || '';
      const facebook = card.socialLinks?.find((s) => s.platform.toLowerCase().includes('facebook') || s.platform.toLowerCase().includes('twitter'))?.url || '';

      return {
        'Card Number': `Card #${String(card.cardNumber).padStart(3, '0')}`,
        'Full Name': card.fullName || '',
        'Designation': card.designation || '',
        'Department': card.department || '',
        'Company Name': card.companyName || '',
        'Company Type': card.companyType || '',

        'Phone 1': phone1,
        'Phone 2': phone2,
        'Phone 3': phone3,
        'Phone 4': phone4,
        'Phone 5': phone5,
        'Additional Phones': additionalPhones,

        'Email 1': email1,
        'Email 2': email2,
        'Email 3': email3,
        'Email 4': email4,
        'Email 5': email5,
        'Additional Emails': additionalEmails,

        'Website 1': website1,
        'Website 2': website2,
        'Additional Websites': additionalWebsites,

        'Address': card.address || '',
        'City': card.city || '',
        'State': card.state || '',
        'Country': card.country || '',
        'Pincode': card.pincode || '',
        'GSTIN': card.gstin || '',

        'LinkedIn': linkedIn,
        'Instagram': instagram,
        'Other Socials': facebook,

        'Services / Products': (card.services || []).join(', '),
        'Notes': card.notes || '',
        'Status': card.status,
        'Created At': card.createdAt ? new Date(card.createdAt).toLocaleString() : '',
      };
    });
  },

  /**
   * Export to Excel (.xlsx) file and share/download.
   */
  async exportToExcel(cards: VisitingCard[]): Promise<string> {
    const rows = this.prepareExportRows(cards);
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto column widths
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, 15),
    }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Visiting Cards');

    if (Platform.OS === 'web') {
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'visiting_cards.xlsx';
      a.click();
      URL.revokeObjectURL(url);
      return 'visiting_cards.xlsx';
    }

    const base64 = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
    const docDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || '';
    const fileUri = `${docDir}visiting_cards.xlsx`;
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Export Visiting Cards Excel',
        UTI: 'com.microsoft.excel.xlsx',
      });
    }

    return fileUri;
  },

  /**
   * Export to CSV file and share/download.
   */
  async exportToCSV(cards: VisitingCard[]): Promise<string> {
    const rows = this.prepareExportRows(cards);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);

    if (Platform.OS === 'web') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'visiting_cards.csv';
      a.click();
      URL.revokeObjectURL(url);
      return 'visiting_cards.csv';
    }

    const docDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || '';
    const fileUri = `${docDir}visiting_cards.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Visiting Cards CSV',
        UTI: 'public.comma-separated-values-text',
      });
    }

    return fileUri;
  },
};
