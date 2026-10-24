<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Deletion & Data Privacy — OgaDriver</title>
    <link rel="icon" href="/favicon.png" type="image/png">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between antialiased selection:bg-emerald-500 selection:text-white">

    <!-- Header Navigation -->
    <header class="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" class="flex items-center space-x-3 text-white">
                <span class="text-xl font-bold tracking-tight text-emerald-400">OgaDriver</span>
                <span class="text-xs uppercase tracking-wider text-slate-400 border border-slate-700 rounded px-2 py-0.5">Privacy & Trust</span>
            </a>
            <a href="/" class="text-xs text-slate-400 hover:text-white transition-colors">Return Home &rarr;</a>
        </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-3xl mx-auto px-4 py-12 flex-1 w-full">
        <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
            <div class="inline-flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-3 py-1.5 rounded-full mb-6 font-medium">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                <span>Google Play & App Store Compliance</span>
            </div>

            <h1 class="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">Delete Account & Erasure Request</h1>
            <p class="text-slate-400 text-sm leading-relaxed mb-8">
                In strict compliance with Google Play Store User Data Policy, Apple App Store Review Guideline 5.1.1(v), and the Nigeria Data Protection Act (NDPA), you have the absolute right to delete your OgaDriver account and permanently erase your personal data at any time.
            </p>

            @if(session('status'))
                <div class="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                    {{ session('status') }}
                </div>
            @endif

            @if(isset($errors) && $errors->any())
                <div class="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                    <ul class="list-disc list-inside space-y-1">
                        @foreach($errors->all() as $err)
                            <li>{{ $err }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <!-- In-App Deletion Instructions -->
            <div class="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 mb-8">
                <h2 class="text-sm font-semibold text-white mb-2 flex items-center">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
                    Option 1: In-App Instant Deletion (Recommended)
                </h2>
                <p class="text-slate-400 text-xs leading-relaxed">
                    If you have the OgaDriver mobile app installed on your smartphone:
                </p>
                <ol class="list-decimal list-inside text-xs text-slate-300 mt-2 space-y-1 ml-1">
                    <li>Open the OgaDriver app and log in.</li>
                    <li>Navigate to the <strong class="text-white">Profile / Account</strong> tab.</li>
                    <li>Scroll to the bottom and tap <strong class="text-rose-400">Delete Account</strong>.</li>
                    <li>Confirm the prompt. Your session will immediately be invalidated and your data wiped.</li>
                </ol>
            </div>

            <!-- Web Deletion Request Form -->
            <div class="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 mb-8">
                <h2 class="text-sm font-semibold text-white mb-2 flex items-center">
                    <span class="w-2 h-2 rounded-full bg-amber-400 mr-2"></span>
                    Option 2: Web Deletion Request Form
                </h2>
                <p class="text-slate-400 text-xs leading-relaxed mb-4">
                    If you cannot access your mobile device or have already uninstalled the application, submit your registered email address below:
                </p>

                <form method="POST" action="/delete-account-request" class="space-y-4">
                    @csrf
                    <div>
                        <label class="block text-xs uppercase tracking-wider text-slate-400 mb-1.5 font-medium">Registered Account Email *</label>
                        <input type="email" name="email" required placeholder="driver@example.com" value="{{ old('email') }}"
                            class="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors">
                    </div>

                    <div>
                        <label class="block text-xs uppercase tracking-wider text-slate-400 mb-1.5 font-medium">Reason for leaving (Optional)</label>
                        <textarea name="reason" rows="2" placeholder="Tell us why you are deleting your account..."
                            class="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors">{{ old('reason') }}</textarea>
                    </div>

                    <div class="flex items-start space-x-3 pt-2">
                        <input type="checkbox" name="confirm_checkbox" id="confirm_checkbox" required
                            class="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900">
                        <label for="confirm_checkbox" class="text-xs text-slate-400 leading-normal">
                            I understand that this action is irreversible. All my personal credentials, verification status, and profile history will be permanently erased.
                        </label>
                    </div>

                    <button type="submit"
                        class="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-rose-600/20 transition-all cursor-pointer">
                        Submit Account Deletion Request
                    </button>
                </form>
            </div>

            <!-- Data Retention & Deletion Policy Explanation -->
            <div class="border-t border-slate-800/80 pt-6">
                <h3 class="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Data Erasure & Statutory Retention Policy</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400 leading-relaxed">
                    <div class="bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
                        <h4 class="font-medium text-emerald-400 mb-1">What is Permanently Erased</h4>
                        <ul class="list-disc list-inside space-y-1">
                            <li>National Identity (NIN) records</li>
                            <li>Uploaded driver's license scans</li>
                            <li>Real-time GPS telemetry & trip logs</li>
                            <li>Facial selfies & biometric checks</li>
                            <li>Active device push tokens & IMEIs</li>
                        </ul>
                    </div>
                    <div class="bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
                        <h4 class="font-medium text-amber-400 mb-1">Statutory Records Retained</h4>
                        <ul class="list-disc list-inside space-y-1">
                            <li>CBN / Tax-auditable wallet ledgers (6 years)</li>
                            <li>Completed dispute resolutions</li>
                            <li>Anonymized aggregate platform telemetry</li>
                        </ul>
                    </div>
                </div>
            </div>

        </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div class="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <span>&copy; {{ date('Y') }} OgaDriver Nigeria. All rights reserved.</span>
            <div class="space-x-4">
                <a href="/privacy" class="hover:text-slate-400">Privacy Policy</a>
                <a href="/terms" class="hover:text-slate-400">Terms of Service</a>
                <a href="mailto:support@ogadriver.ng" class="hover:text-slate-400">Support</a>
            </div>
        </div>
    </footer>

</body>
</html>
