import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages 2+)
        if self._pageNumber > 1:
            self.drawString(54, 750, "OgaDriver — The Remaining Integration Plan")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)

        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)
        
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 30, page_str)
        self.drawString(54, 30, "CONFIDENTIAL & PROPRIETARY — OGADRIVER.NG")
        self.restoreState()

def build_pdf():
    pdf_filename = "The_Remaining_Integration_Plan.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    navy = colors.HexColor("#0F172A")
    mint = colors.HexColor("#0D9488")
    emerald = colors.HexColor("#10B981")
    dark_slate = colors.HexColor("#1E293B")
    text_dark = colors.HexColor("#334155")
    bg_light = colors.HexColor("#F8FAFC")
    border_color = colors.HexColor("#E2E8F0")
    amber = colors.HexColor("#D97706")
    red = colors.HexColor("#DC2626")

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=navy,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=mint,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=navy,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=dark_slate,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=text_dark,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=body_style,
        leftIndent=12,
        bulletIndent=4,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'Code',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0F172A"),
        backColor=colors.HexColor("#F1F5F9"),
        borderColor=colors.HexColor("#CBD5E1"),
        borderWidth=0.5,
        borderPadding=6,
        spaceBefore=4,
        spaceAfter=6
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white,
        alignment=0
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=text_dark
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell_style,
        fontName='Helvetica-Bold',
        textColor=navy
    )

    table_cell_link = ParagraphStyle(
        'TableCellLink',
        parent=table_cell_style,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor("#2563EB")
    )

    badge_missing = ParagraphStyle(
        'BadgeMissing',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=red
    )

    badge_ready = ParagraphStyle(
        'BadgeReady',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=emerald
    )

    story = []

    # Title Block
    story.append(Paragraph("THE REMAINING INTEGRATION PLAN", title_style))
    story.append(Paragraph("OgaDriver Platform — API Audit, Service Provider Onboarding & App Store Release Roadmap", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=mint, spaceAfter=12))

    # Meta Info Card
    meta_data = [
        [Paragraph("<b>Production Domain:</b> https://ogadriver.ng", table_cell_style), Paragraph("<b>Target Environment:</b> Namecheap cPanel Shared / VPS", table_cell_style)],
        [Paragraph("<b>Target Mobile Stores:</b> Google Play & Apple App Store", table_cell_style), Paragraph("<b>Generated Date:</b> September 21, 2026", table_cell_style)],
    ]
    meta_table = Table(meta_data, colWidths=[250, 254])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # Executive Overview
    story.append(Paragraph("1. Executive Summary & Purpose", h1_style))
    story.append(Paragraph(
        "This document details the complete production launch roadmap for <b>OgaDriver</b>. Based on an audit of the live production <code>.env</code> file and system architecture, this plan highlights all <b>missing credentials</b>, <b>third-party service signups</b>, <b>cost-optimization strategies</b>, and step-by-step instructions for registering <b>Android Play Console</b> and <b>Apple Developer Accounts</b>.",
        body_style
    ))

    # Section 2: Production Audit
    story.append(Paragraph("2. Production Environment API Audit & Action Items", h1_style))
    story.append(Paragraph("An analysis of your production configuration identified key integration gaps that must be finalized before public marketing launch:", body_style))

    audit_headers = ["Integration / API", "Current Status (.env)", "Required Action", "Sign-Up / Portal Link"]
    audit_data = [[
        Paragraph(h, table_header_style) for h in audit_headers
    ]]

    rows = [
        (
            "Paystack Payment Gateway",
            "Placeholder Live Keys<br/><code>pk_live_your_actual...</code>",
            "Complete Paystack business compliance, toggle to Live Mode, copy Live Public & Secret keys into .env.",
            "https://dashboard.paystack.com/#/signup",
            "USER ACTION"
        ),
        (
            "Cloud Storage (Cloudflare R2)",
            "AWS_ACCESS_KEY_ID template<br/>(Bucket: ogadriver)",
            "Generate R2 API Token in Cloudflare dashboard, add Access Key & Secret to .env.",
            "https://dash.cloudflare.com/sign-up",
            "USER ACTION"
        ),
        (
            "SMS & OTP Service (Termii V4)",
            "API Key & Sender ID Active<br/><code>tlv_sR-VvmpjUK...</code>",
            "Successfully configured in .env and config/services.php. Sender ID: OgaDriver.",
            "https://termii.com",
            "ACTIVE"
        ),
        (
            "LocationIQ Geocoding",
            "API Key Active<br/><code>pk.8ae3192c04f...</code>",
            "Configured for reverse geocoding & location autocompletion.",
            "https://locationiq.com",
            "ACTIVE"
        ),
        (
            "Firebase Push (FCM)",
            "Credentials Verified<br/><code>firebase-credentials.json</code>",
            "Uploaded to storage/app/firebase-credentials.json. App ID: ogadriver-e5e7b.",
            "https://console.firebase.google.com",
            "ACTIVE"
        ),
        (
            "Reverb WebSockets",
            "Broadcaster Active<br/><code>BROADCAST_CONNECTION=reverb</code>",
            "App ID: 720671. Configured for real-time live driver radar telemetry.",
            "https://ogadriver.ng",
            "ACTIVE"
        ),
        (
            "Google Cloud Vision API",
            "Credentials File Verified<br/><code>google-credentials.json</code>",
            "Configured at /home/englcxqe/app/storage/app/google-credentials.json.",
            "https://console.cloud.google.com",
            "ACTIVE"
        ),
        (
            "Google OAuth Socialite",
            "Client ID & Secret Verified<br/><code>522060418089...</code>",
            "Active for Google Sign-In & direct user onboarding.",
            "https://ogadriver.ng/auth/google/callback",
            "ACTIVE"
        )
    ]

    for item, status, action, link, flag in rows:
        b_style = badge_ready if flag == "ACTIVE" else badge_missing
        flag_p = Paragraph(f"<b>[{flag}]</b><br/>{status}", b_style)
        audit_data.append([
            Paragraph(item, table_cell_bold),
            flag_p,
            Paragraph(action, table_cell_style),
            Paragraph(f"<a href='{link}'>{link}</a>", table_cell_link)
        ])

    audit_table = Table(audit_data, colWidths=[110, 110, 154, 130])
    audit_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), navy),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))
    story.append(audit_table)
    story.append(Spacer(1, 10))

    # Section 3: Recommended Service Providers
    story.append(Paragraph("3. Recommended Service Providers & Cost Matrix", h1_style))
    story.append(Paragraph("To ensure OgaDriver runs <b>flawlessly</b> and at the <b>lowest operational cost</b> during high traffic, the following recommended vendor stack is prioritized:", body_style))

    provider_headers = ["Category", "Recommended Vendor", "Official Website", "Service to Start With", "Est. Cost & Benefit"]
    provider_data = [[Paragraph(h, table_header_style) for h in provider_headers]]

    p_rows = [
        ("SMS & OTP", "Termii", "https://termii.com", "SMS API + Sender ID", "₦3.50/SMS — 80% cheaper than international gateways."),
        ("WhatsApp Alerts", "Termii WhatsApp API", "https://termii.com", "WhatsApp Messaging", "₦7.50/msg — Instant driver proposals & booking receipts."),
        ("Payment Gateway", "Paystack / Flutterwave", "https://paystack.com", "Inline Checkout + Split Payments", "1.5% capped at ₦2,000 — Automated driver payout split."),
        ("Push Notifications", "Firebase Cloud Messaging", "https://console.firebase.google.com", "FCM Web & Mobile SDK", "100% FREE — Unlimited push alerts to Android & PWA."),
        ("Media Storage", "Cloudflare R2", "https://cloudflare.com", "R2 Object Storage", "$0 Egress Fees — Saves 100% bandwidth costs on license photos."),
        ("Maps & Geocoding", "LocationIQ + MapLibre", "https://locationiq.com", "Autocomplete & Reverse Geocoding", "Free tier: 5,000/day — 85% cheaper than Google Maps tiles.")
    ]

    for cat, vendor, web, service, cost in p_rows:
        provider_data.append([
            Paragraph(cat, table_cell_bold),
            Paragraph(vendor, table_cell_style),
            Paragraph(f"<a href='{web}'>{web}</a>", table_cell_link),
            Paragraph(service, table_cell_style),
            Paragraph(cost, table_cell_style)
        ])

    provider_table = Table(provider_data, colWidths=[90, 85, 125, 94, 110])
    provider_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), dark_slate),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))
    story.append(provider_table)
    story.append(Spacer(1, 12))

    # Page Break for Developer Accounts & Setup Guide
    story.append(PageBreak())

    # Section 4: Developer Accounts Registration Guide
    story.append(Paragraph("4. Mobile Developer Account Registration Guide", h1_style))
    story.append(Paragraph("Publishing OgaDriver to the Google Play Store and Apple App Store requires registering official personal/company developer accounts:", body_style))

    # Google Play Store Guide
    story.append(Paragraph("Google Play Console Developer Account (Android)", h2_style))
    story.append(Paragraph("<b>Official Signup Website:</b> <a href='https://play.google.com/console/signup'>https://play.google.com/console/signup</a>", body_style))
    story.append(Paragraph("<b>Registration Fee:</b> $25 USD (One-time registration fee)", body_style))
    story.append(Paragraph("<b>Requirements & Step-by-Step Setup:</b>", body_style))
    story.append(Paragraph("1. Log in with your official Google Account (e.g., <code>support@ogadriver.ng</code>).", bullet_style))
    story.append(Paragraph("2. Select <b>Account Type</b>: Choose <i>Personal Account</i> or <i>Organization</i>.", bullet_style))
    story.append(Paragraph("3. Provide Developer Name, Public Email, Physical Address, and Phone Number with international SMS verification.", bullet_style))
    story.append(Paragraph("4. Complete the $25 payment using an international Visa/Mastercard.", bullet_style))
    story.append(Paragraph("5. Complete Identity Verification by uploading a valid Government ID (International Passport, Driver's License, or NIN Card).", bullet_style))
    story.append(Paragraph("6. <b>App Build Submission:</b> Build signed release bundle via Capacitor Android (<code>npx cap add android</code> -> <code>./gradlew bundleRelease</code>), and upload the <code>.aab</code> file to Google Play Console.", bullet_style))

    story.append(Spacer(1, 8))

    # Apple Developer Account Guide
    story.append(Paragraph("Apple Developer Program Account (iOS)", h2_style))
    story.append(Paragraph("<b>Official Signup Website:</b> <a href='https://developer.apple.com/programs/enroll/'>https://developer.apple.com/programs/enroll/</a>", body_style))
    story.append(Paragraph("<b>Registration Fee:</b> $99 USD / year (Annual subscription)", body_style))
    story.append(Paragraph("<b>Requirements & Step-by-Step Setup:</b>", body_style))
    story.append(Paragraph("1. Sign in with an Apple ID that has Two-Factor Authentication enabled.", bullet_style))
    story.append(Paragraph("2. Download the <b>Apple Developer App</b> on an iPhone or iPad to complete enrollment quickly.", bullet_style))
    story.append(Paragraph("3. Provide legal Name, Address, Phone Number, and Government ID verification.", bullet_style))
    story.append(Paragraph("4. If enrolling as an <i>Organization</i>, provide your legal D-U-N-S Number (Data Universal Numbering System from Dun & Bradstreet).", bullet_style))
    story.append(Paragraph("5. Pay the $99 annual fee via Apple Pay or credit card.", bullet_style))
    story.append(Paragraph("6. <b>App Store Submission:</b> Open Xcode (<code>npx cap add ios</code> -> <code>npx cap open ios</code>), archive the project, and upload to App Store Connect / TestFlight.", bullet_style))

    story.append(Spacer(1, 10))

    # Section 5: cPanel Setup & Production Deployment Checklist
    story.append(Paragraph("5. Namecheap cPanel Environment Setup Instructions", h1_style))
    story.append(Paragraph("Follow these exact steps to configure your cPanel environment for seamless API operation:", body_style))

    story.append(Paragraph("<b>Step 1: PHP Version & Extensions</b>", h2_style))
    story.append(Paragraph("In cPanel -> <b>Select PHP Version</b>, choose <b>PHP 8.2</b> or <b>PHP 8.3</b>. Ensure the following extensions are enabled: <code>bcmath</code>, <code>curl</code>, <code>fileinfo</code>, <code>gd</code>, <code>mbstring</code>, <code>mysqli</code>, <code>openssl</code>, <code>pdo_mysql</code>, <code>xml</code>, <code>zip</code>.", body_style))

    story.append(Paragraph("<b>Step 2: Update Paystack Production Keys in .env</b>", h2_style))
    story.append(Paragraph("Replace placeholder Paystack keys in <code>.env</code> with your live production credentials:", body_style))
    
    paystack_code = """PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_CALLBACK_URL=https://ogadriver.ng/api/payments/callback"""
    story.append(Paragraph(paystack_code.replace("\n", "<br/>"), code_style))

    story.append(Paragraph("<b>Step 3: Laravel Optimization Commands</b>", h2_style))
    story.append(Paragraph("Run the following terminal commands inside cPanel Terminal or SSH:", body_style))
    
    cli_code = """cd /home/englcxqe/app
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache
php artisan storage:link"""
    story.append(Paragraph(cli_code.replace("\n", "<br/>"), code_style))

    story.append(Paragraph("<b>Step 4: Configure Automated cPanel Cron Job</b>", h2_style))
    story.append(Paragraph("In cPanel -> <b>Cron Jobs</b>, add the following schedule (runs every minute):", body_style))
    story.append(Paragraph("<code>* * * * * cd /home/englcxqe/app && php artisan schedule:run >> /dev/null 2>&1</code>", code_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated: {os.path.abspath(pdf_filename)}")

if __name__ == "__main__":
    build_pdf()
