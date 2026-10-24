<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SystemAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $title;
    protected $message;
    protected $type;
    protected $actionUrl;

    /**
     * Create a new notification instance.
     */
    public function __construct($title, $message, $type = 'info', $actionUrl = null)
    {
        $this->title = $title;
        $this->message = $message;
        $this->type = $type;
        $this->actionUrl = $actionUrl;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];

        $settings = \Illuminate\Support\Facades\Cache::get('admin_notification_settings', [
            'emailNotifications' => true,
            'smsNotifications' => false,
            'pushNotifications' => true,
            'inAppNotifications' => true,
            'newBookingAlert' => true,
            'bookingConfirmation' => true,
            'bookingReminder' => true,
            'driverArrival' => true,
            'paymentReceived' => true,
            'subscriptionRenewal' => true,
            'systemAlerts' => true,
            'securityAlerts' => true,
        ]);

        $shouldMail = $settings['emailNotifications'] ?? true;

        if ($this->type === 'booking' && !($settings['newBookingAlert'] ?? true)) {
            $shouldMail = false;
        }
        if ($this->type === 'subscription' && !($settings['subscriptionRenewal'] ?? true)) {
            $shouldMail = false;
        }
        if ($this->type === 'payment' && !($settings['paymentReceived'] ?? true)) {
            $shouldMail = false;
        }
        if ($this->type === 'system' && !($settings['systemAlerts'] ?? true)) {
            $shouldMail = false;
        }
        if ($this->type === 'security' && !($settings['securityAlerts'] ?? true)) {
            $shouldMail = false;
        }

        if ($notifiable->email && $shouldMail) {
            $channels[] = 'mail';
        }

        if ($settings['pushNotifications'] ?? true) {
            if ($notifiable->fcm_token && class_exists(\NotificationChannels\Fcm\FcmChannel::class)) {
                $channels[] = \NotificationChannels\Fcm\FcmChannel::class;
            }
            if (class_exists(\NotificationChannels\WebPush\WebPushChannel::class)) {
                $channels[] = \NotificationChannels\WebPush\WebPushChannel::class;
            }
        }

        return $channels;
    }

    /**
     * Get the FCM representation of the notification.
     */
    public function toFcm(object $notifiable)
    {
        return \NotificationChannels\Fcm\FcmMessage::create()
            ->setData([
                'title' => (string) $this->title,
                'message' => (string) $this->message,
                'type' => (string) $this->type,
                'action_url' => (string) $this->actionUrl,
            ])
            ->setNotification(\NotificationChannels\Fcm\Resources\Notification::create()
                ->setTitle($this->title)
                ->setBody($this->message));
    }

    /**
     * Get the WebPush representation of the notification.
     */
    public function toWebPush(object $notifiable, object $notification)
    {
        return (new \NotificationChannels\WebPush\WebPushMessage)
            ->title($this->title)
            ->body($this->message)
            ->action('View App', 'view_app');
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('Ogadriver.ng Alert: ' . $this->title)
            ->greeting('Hello ' . ($notifiable->name ?? 'User') . ',')
            ->line($this->message);

        if ($this->actionUrl) {
            $mail->action('View Details', $this->actionUrl);
        }

        $mail->line('Thank you for using Ogadriver.ng!');

        return $mail;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
            'action_url' => $this->actionUrl,
        ];
    }
}
