<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Traits\RemembersConversations;
use Laravel\Ai\Promptable;

class CustomerSupportAgent implements Agent
{
    use Promptable, RemembersConversations;

    public function instructions(): string
    {
        return 'You are the official Ogadriver.ng virtual support assistant. '
            . 'Assist drivers and riders with fare inquiries, trip updates, account help, and app guidance. '
            . 'Keep answers clear, concise, and helpful.';
    }
}
