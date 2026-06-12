'use client';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last Updated: May 11, 2026</p>

        <div className="prose dark:prose-invert max-w-none space-y-6">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Introduction</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Foylx Note (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;, or &quot;the App&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Information We Collect</h2>
            <div className="text-gray-700 dark:text-gray-300 space-y-2">
              <p className="font-semibold">When you use Foylx Note, we collect:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Account Information:</strong> Email address, name, and profile picture (from Google authentication)</li>
                <li><strong>Notebook Data:</strong> Your notes, drawings, handwriting, text, shapes, and images</li>
                <li><strong>Media Files:</strong> Audio recordings, OCR-processed text, and exported documents</li>
                <li><strong>Usage Information:</strong> Features you use, timestamps, and app performance data</li>
                <li><strong>Device Information:</strong> Browser type, operating system, and device fingerprint for license verification</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">How We Use Your Data</h2>
            <div className="text-gray-700 dark:text-gray-300 space-y-2">
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Authentication:</strong> To verify your identity and maintain your account</li>
                <li><strong>Google Drive Sync:</strong> To back up and sync your notebooks (only if you explicitly enable this)</li>
                <li><strong>License Verification:</strong> To validate your license key and device registration</li>
                <li><strong>Improvement:</strong> To analyze usage patterns and improve app features</li>
                <li><strong>Support:</strong> To provide customer support and troubleshoot issues</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Data Storage &amp; Security</h2>
            <div className="text-gray-700 dark:text-gray-300 space-y-2">
              <p>
                <strong>Local Storage (Default):</strong> All your notebooks and notes are stored locally in your browser&apos;s IndexedDB. This data never leaves your device unless you explicitly enable cloud sync.
              </p>
              <p>
                <strong>Google Drive (Optional):</strong> When you enable Google Drive sync, your notebooks are encrypted and backed up to your Google Drive. Only you can access these files.
              </p>
              <p>
                <strong>License System:</strong> License keys and activation data are verified through Supabase. Your email and device fingerprint are stored for license verification only.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Third-Party Services</h2>
            <div className="text-gray-700 dark:text-gray-300 space-y-3">
              <div>
                <strong>Google Authentication (OAuth 2.0)</strong>
                <p className="text-sm">We use Google Sign-In for authentication. Google&apos;s privacy policy: https://policies.google.com/privacy</p>
              </div>
              <div>
                <strong>Google Drive API</strong>
                <p className="text-sm">Optional backup and sync. Only activated with your permission. Governed by Google&apos;s terms.</p>
              </div>
              <div>
                <strong>Supabase</strong>
                <p className="text-sm">Used for license verification and activation logging. Supabase&apos;s privacy policy: https://supabase.com/privacy</p>
              </div>
              <div>
                <strong>Tesseract.js (OCR)</strong>
                <p className="text-sm">Offline handwriting recognition. All processing happens locally in your browser.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Data Retention</h2>
            <div className="text-gray-700 dark:text-gray-300 space-y-2">
              <p>
                <strong>Local Data:</strong> Your notebooks remain in your browser until you manually delete them.
              </p>
              <p>
                <strong>Account Data:</strong> When you delete your account, we remove your data from our servers within 30 days. Google Drive files remain in your Drive.
              </p>
              <p>
                <strong>License Data:</strong> License activation records are kept for compliance purposes.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Your Rights</h2>
            <div className="text-gray-700 dark:text-gray-300 space-y-2">
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Access:</strong> You can access all your data in the app</li>
                <li><strong>Export:</strong> You can export your notebooks as PDF, DOCX, or images</li>
                <li><strong>Delete:</strong> You can delete any notebook or your entire account</li>
                <li><strong>Opt-out:</strong> You can disable Google Drive sync at any time</li>
                <li><strong>Revoke:</strong> You can revoke app access from your Google Account settings</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Children&apos;s Privacy</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Foylx Note is not intended for children under 13. We do not knowingly collect information from children under 13. If we become aware of such collection, we will delete the information promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Changes to Privacy Policy</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this Privacy Policy periodically. We will notify you of changes by posting the new policy here and updating the &quot;Last Updated&quot; date. Your continued use of the app constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Contact Us</h2>
            <div className="text-gray-700 dark:text-gray-300">
              <p>If you have questions about this Privacy Policy or our privacy practices, please contact us at:</p>
              <p className="mt-2">
                <strong>Email:</strong> <a href="mailto:a3kmstudio@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">a3kmstudio@gmail.com</a>
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
