<?php

namespace App\Enums;

enum CardStatus: string
{
   case ACTIVE = 'active';
   case USED = 'used';
   case EXPIRED = 'expired';
   case DISABLED = 'disabled';

   public function getLabel(): string
   {
      return match ($this) {
         self::ACTIVE => 'Active',
         self::USED => 'Used',
         self::EXPIRED => 'Expired',
         self::DISABLED => 'Disabled',
      };
   }
}
