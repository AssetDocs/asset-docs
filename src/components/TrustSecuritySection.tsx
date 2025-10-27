
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Award, CheckCircle } from 'lucide-react';

const TrustSecuritySection: React.FC = () => {
  const securityFeatures = [
    {
      icon: Shield,
      title: "Bank-Level Encryption",
      description: "Your data is protected with AES-256 encryption, the same standard used by financial institutions."
    },
    {
      icon: Lock,
      title: "Secure Cloud Storage",
      description: "All files are stored in SOC 2 compliant data centers with redundant backups."
    },
    {
      icon: Award,
      title: "Professional Insurance",
      description: "Our platform is backed by professional liability insurance up to $1M for your peace of mind."
    },
    {
      icon: CheckCircle,
      title: "GDPR Compliant",
      description: "Full compliance with international data protection regulations."
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-brand-blue mb-4">
          Your Data, Secured & Protected
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          We understand that you're trusting us with your most valuable asset information. 
          That's why we've implemented enterprise-grade security measures to keep your data safe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {securityFeatures.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <feature.icon className="h-6 w-6 mr-3 text-brand-blue" />
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-brand-blue">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-brand-blue mb-2">
              Third-Party Verified
            </h3>
            <p className="text-gray-700">
              Our security practices are regularly audited by independent cybersecurity firms. 
              We maintain SOC 2 Type II compliance and undergo annual penetration testing.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrustSecuritySection;
