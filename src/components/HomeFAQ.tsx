import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const HomeFAQ: React.FC = () => {
  const faqs = [
    {
      question: "What is a digital home inventory?",
      answer: "A digital home inventory is a comprehensive record of your property and possessions, including photos, videos, receipts, and detailed descriptions. It serves as proof of ownership for insurance claims, estate planning, and property documentation."
    },
    {
      question: "How does Asset Safe protect my data?",
      answer: "Asset Safe uses enterprise-grade encryption, secure cloud storage, and follows industry best practices for data protection. All files are encrypted both in transit and at rest, ensuring your property documentation remains private and secure."
    },
    {
      question: "What is the Legacy Locker?",
      answer: "Legacy Locker is a secure digital vault for storing important information your loved ones will need—estate documents, account details, personal notes, and instructions. It's not a legal will, but a companion tool that supports your estate planning by organizing critical information in one protected location."
    },
    {
      question: "Can I use Asset Safe for insurance claims?",
      answer: "Yes. Asset Safe is designed to support and streamline insurance claims by helping you document your property before and after a loss. Asset Safe provides time-stamped, organized documentation—including proof of ownership, condition records, photos, videos, and user-entered values—that insurers commonly request during the claims process. These records can help reduce delays, minimize disputes, and improve communication with your insurance provider."
    },
    {
      question: "How do I get started with Asset Safe?",
      answer: "Getting started is easy! Simply create an account, choose your subscription plan, and begin documenting your assets. Our intuitive platform guides you through the process of adding properties, uploading photos and videos, and organizing your valuable documentation."
    },
    {
      question: "How many properties can I document?",
      answer: "Our Standard plan supports up to 3 properties with 25GB storage, perfect for most homeowners. The Premium plan offers unlimited properties with 100GB storage, ideal for landlords, estate managers, or multi-property owners."
    },
    {
      question: "Can I share access with family members or professionals?",
      answer: "Yes! You can invite up to 5 trusted contacts with different permission levels: administrator (full access), contributor (can add/edit content), or viewer (read-only access). This is perfect for sharing with family, estate planners, or insurance agents."
    },
    {
      question: "What makes Asset Safe different from other home inventory apps?",
      answer: "Asset Safe combines comprehensive property documentation with estate planning tools (Legacy Locker), post-damage reporting, voice notes for sentimental items, and secure password storage—all in one platform. We're designed specifically for unexpected life events: insurance claims, estate transitions, divorce, natural disasters, and more."
    },
    {
      question: "What is Verified Account status?",
      answer: "Verified status indicates that your Asset Safe account is complete, active, and claim-ready. To earn the blue Verified badge, you need to: verify your email, have an account for at least 2 weeks, upload at least 10 files, complete your profile (first and last name), and save at least one property. Verified accounts demonstrate you're serious about protecting your assets."
    },
    {
      question: "What is Verified+ status?",
      answer: "Verified+ is the highest trust tier for Asset Safe accounts. It's awarded to users who have achieved Verified status AND enabled Two-Factor Authentication (2FA). The gold Verified+ badge shows you've taken extra steps to secure your account and documentation with maximum protection."
    },
    {
      question: "How do I upgrade from Verified to Verified+?",
      answer: "Once you've earned Verified status, simply enable Two-Factor Authentication (2FA) in your Account Settings. Your status will automatically upgrade to Verified+ with the gold shield badge, indicating your account has premium security protection enabled."
    }
  ];

  return (
    <section className="py-16 bg-secondary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about protecting your assets with Asset Safe
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Have more questions? We're here to help.
            </p>
            <a 
              href="/contact" 
              className="text-primary hover:underline font-medium"
            >
              Contact our support team →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeFAQ;