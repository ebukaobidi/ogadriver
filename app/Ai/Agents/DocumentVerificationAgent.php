<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

class DocumentVerificationAgent implements Agent, HasStructuredOutput
{
    use Promptable;

    public function instructions(): string
    {
        return 'You are an optical character recognition (OCR) and document extraction specialist for Ogadriver.ng. '
            . 'Examine the provided driver license or identification document image and accurately extract all identity fields. '
            . 'If a field is unreadable or not visible, return null for that field.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'full_name' => $schema->string()->nullable()->description('Full name as stated on the document'),
            'license_number' => $schema->string()->nullable()->description('Driver license or document identification number'),
            'date_of_birth' => $schema->string()->nullable()->description('Date of birth in YYYY-MM-DD format'),
            'expiry_date' => $schema->string()->nullable()->description('Document expiration date in YYYY-MM-DD format'),
            'issuing_authority' => $schema->string()->nullable()->description('State or agency that issued the document'),
            'is_expired' => $schema->boolean()->required()->description('True if the document expiry date is prior to today'),
            'confidence_score' => $schema->integer()->required()->description('Document clarity and legibility confidence score from 1 to 100'),
        ];
    }
}
