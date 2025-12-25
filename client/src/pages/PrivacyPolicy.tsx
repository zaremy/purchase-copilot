export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-neutral-500 mb-8">Last updated: December 25, 2024</p>

        <div className="space-y-8 text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Overview</h2>
            <p>
              Pre-Purchase Pal ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Information We Collect</h2>
            <p className="mb-3">We collect minimal information necessary to provide our vehicle inspection checklist service:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Vehicle Information:</strong> Year, make, model, VIN, mileage, and asking price of vehicles you add to the app</li>
              <li><strong>Inspection Data:</strong> Checklist responses, notes, and flags you create during vehicle inspections</li>
              <li><strong>Usage Data:</strong> Basic analytics about app usage to improve our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">How We Use Your Information</h2>
            <p className="mb-3">Your information is used solely to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide the vehicle inspection checklist functionality</li>
              <li>Save your inspection progress and vehicle data</li>
              <li>Enable vehicle comparison features</li>
              <li>Improve app performance and user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Data Storage</h2>
            <p>
              Pre-Purchase Pal uses a local-first approach. Your vehicle data and inspection notes are stored on your device and on our secure servers. We do not sell, trade, or transfer your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data. All data transmitted between your device and our servers is encrypted using HTTPS/TLS protocols.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Third-Party Services</h2>
            <p>
              We may use third-party services for VIN decoding (NHTSA public API) to automatically populate vehicle specifications. These services receive only the VIN you provide and no personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data stored in the app</li>
              <li>Delete your data at any time through the app settings</li>
              <li>Request information about how your data is used</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Children's Privacy</h2>
            <p>
              Our app is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2 font-medium">prepurchasepal@gmail.com</p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-neutral-200 text-center text-sm text-neutral-500">
          © 2024 Pre-Purchase Pal. All rights reserved.
        </div>
      </div>
    </div>
  );
}
