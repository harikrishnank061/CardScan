import { VisitingCard, DuplicateMatch } from '../types/card';

export const duplicateService = {
  /**
   * Check if target card has potential duplicate matches in existing cards list.
   */
  findDuplicates(targetCard: VisitingCard, allCards: VisitingCard[]): DuplicateMatch[] {
    const matches: DuplicateMatch[] = [];

    const normalize = (str?: string) => (str ? str.toLowerCase().trim().replace(/[^a-z0-9]/g, '') : '');

    const targetName = normalize(targetCard.fullName);
    const targetCompany = normalize(targetCard.companyName);
    const targetPhones = (targetCard.phoneNumbers || []).map(normalize).filter(Boolean);
    const targetEmails = (targetCard.emailAddresses || []).map(normalize).filter(Boolean);

    for (const existing of allCards) {
      if (existing.id === targetCard.id) continue;

      const matchedFields: string[] = [];

      const existingName = normalize(existing.fullName);
      const existingCompany = normalize(existing.companyName);
      const existingPhones = (existing.phoneNumbers || []).map(normalize).filter(Boolean);
      const existingEmails = (existing.emailAddresses || []).map(normalize).filter(Boolean);

      // Check Name match
      if (targetName && existingName && targetName === existingName) {
        matchedFields.push('Full Name');
      }

      // Check Company match
      if (targetCompany && existingCompany && targetCompany === existingCompany) {
        matchedFields.push('Company Name');
      }

      // Check Phone match
      const phoneMatch = targetPhones.some((p) => existingPhones.includes(p));
      if (phoneMatch) {
        matchedFields.push('Phone Number');
      }

      // Check Email match
      const emailMatch = targetEmails.some((e) => existingEmails.includes(e));
      if (emailMatch) {
        matchedFields.push('Email Address');
      }

      // If at least 2 fields match or phone/email exact match with name
      if (
        matchedFields.length >= 2 ||
        (matchedFields.includes('Full Name') && (matchedFields.includes('Phone Number') || matchedFields.includes('Email Address'))) ||
        (matchedFields.includes('Email Address') && matchedFields.includes('Company Name'))
      ) {
        matches.push({
          existingCard: existing,
          matchedFields,
        });
      }
    }

    return matches;
  },

  /**
   * Merge target card into existing card combining all phone numbers, email addresses, websites, etc.
   */
  mergeCards(targetCard: VisitingCard, existingCard: VisitingCard): VisitingCard {
    const mergedPhones = Array.from(new Set([...(existingCard.phoneNumbers || []), ...(targetCard.phoneNumbers || [])]));
    const mergedEmails = Array.from(new Set([...(existingCard.emailAddresses || []), ...(targetCard.emailAddresses || [])]));
    const mergedWebsites = Array.from(new Set([...(existingCard.websites || []), ...(targetCard.websites || [])]));
    const mergedServices = Array.from(new Set([...(existingCard.services || []), ...(targetCard.services || [])]));

    return {
      ...existingCard,
      fullName: targetCard.fullName || existingCard.fullName,
      designation: targetCard.designation || existingCard.designation,
      department: targetCard.department || existingCard.department,
      companyName: targetCard.companyName || existingCard.companyName,
      companyType: targetCard.companyType || existingCard.companyType,
      phoneNumbers: mergedPhones,
      emailAddresses: mergedEmails,
      websites: mergedWebsites,
      address: targetCard.address || existingCard.address,
      city: targetCard.city || existingCard.city,
      state: targetCard.state || existingCard.state,
      country: targetCard.country || existingCard.country,
      pincode: targetCard.pincode || existingCard.pincode,
      gstin: targetCard.gstin || existingCard.gstin,
      socialLinks: targetCard.socialLinks?.length ? targetCard.socialLinks : existingCard.socialLinks,
      services: mergedServices,
      notes: [existingCard.notes, targetCard.notes].filter(Boolean).join(' | '),
      status: 'processed',
      updatedAt: new Date().toISOString(),
    };
  },
};
