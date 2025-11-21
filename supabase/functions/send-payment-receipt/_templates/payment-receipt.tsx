import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface PaymentReceiptEmailProps {
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  paymentDate: string;
  planName: string;
  transactionId: string;
  last4?: string;
  billingAddress?: {
    line1?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

export const PaymentReceiptEmail = ({
  customerName,
  customerEmail,
  amount,
  currency,
  paymentDate,
  planName,
  transactionId,
  last4,
  billingAddress,
}: PaymentReceiptEmailProps) => {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);

  return (
    <Html>
      <Head />
      <Preview>Your payment receipt from AssetSafe - {formattedAmount}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Payment Receipt</Heading>
          
          <Text style={text}>
            Hi {customerName},
          </Text>
          
          <Text style={text}>
            Thank you for your payment! This email confirms that we have received your payment.
          </Text>

          <Section style={receiptBox}>
            <Text style={receiptTitle}>Receipt Details</Text>
            
            <Hr style={divider} />
            
            <Section style={receiptRow}>
              <Text style={receiptLabel}>Amount Paid:</Text>
              <Text style={receiptValue}>{formattedAmount}</Text>
            </Section>
            
            <Section style={receiptRow}>
              <Text style={receiptLabel}>Plan:</Text>
              <Text style={receiptValue}>{planName}</Text>
            </Section>
            
            <Section style={receiptRow}>
              <Text style={receiptLabel}>Payment Date:</Text>
              <Text style={receiptValue}>{paymentDate}</Text>
            </Section>
            
            <Section style={receiptRow}>
              <Text style={receiptLabel}>Transaction ID:</Text>
              <Text style={receiptValue}>{transactionId}</Text>
            </Section>
            
            {last4 && (
              <Section style={receiptRow}>
                <Text style={receiptLabel}>Payment Method:</Text>
                <Text style={receiptValue}>Card ending in {last4}</Text>
              </Section>
            )}
            
            <Hr style={divider} />
            
            {billingAddress && (
              <>
                <Text style={receiptSubtitle}>Billing Address</Text>
                <Text style={addressText}>
                  {billingAddress.line1 && `${billingAddress.line1}\n`}
                  {billingAddress.city && `${billingAddress.city}`}
                  {billingAddress.state && `, ${billingAddress.state}`}
                  {billingAddress.postal_code && ` ${billingAddress.postal_code}`}
                  {billingAddress.country && `\n${billingAddress.country}`}
                </Text>
              </>
            )}
          </Section>

          <Text style={text}>
            You can access your account and manage your subscription anytime at{' '}
            <Link href="https://www.assetsafe.net/account" style={link}>
              your account dashboard
            </Link>.
          </Text>

          <Text style={text}>
            If you have any questions about this payment, please don't hesitate to contact us.
          </Text>

          <Hr style={divider} />

          <Text style={footer}>
            <Link
              href="https://www.assetsafe.net"
              target="_blank"
              style={footerLink}
            >
              AssetSafe
            </Link>
            <br />
            Document and protect what matters most
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PaymentReceiptEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0 40px',
};

const text = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  padding: '0 40px',
};

const receiptBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  margin: '32px 40px',
  padding: '24px',
};

const receiptTitle = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const receiptSubtitle = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '600',
  margin: '16px 0 8px',
};

const receiptRow = {
  display: 'flex',
  justifyContent: 'space-between',
  margin: '12px 0',
};

const receiptLabel = {
  color: '#6b7280',
  fontSize: '14px',
  margin: 0,
  flex: '1',
};

const receiptValue = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '500',
  margin: 0,
  textAlign: 'right' as const,
  flex: '1',
};

const addressText = {
  color: '#525252',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
  whiteSpace: 'pre-line' as const,
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
};

const footer = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '32px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
};

const footerLink = {
  color: '#2563eb',
  textDecoration: 'none',
  fontWeight: '500',
};
