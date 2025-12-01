-- Add new contact fields to legacy_locker table for VIP contacts
ALTER TABLE legacy_locker
ADD COLUMN spouse_name TEXT,
ADD COLUMN spouse_contact TEXT,
ADD COLUMN attorney_name TEXT,
ADD COLUMN attorney_firm TEXT,
ADD COLUMN attorney_contact TEXT,
ADD COLUMN business_partner_name TEXT,
ADD COLUMN business_partner_company TEXT,
ADD COLUMN business_partner_contact TEXT,
ADD COLUMN investment_firm_name TEXT,
ADD COLUMN investment_advisor_name TEXT,
ADD COLUMN investment_firm_contact TEXT,
ADD COLUMN financial_advisor_name TEXT,
ADD COLUMN financial_advisor_firm TEXT,
ADD COLUMN financial_advisor_contact TEXT;