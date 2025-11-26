<?php

namespace App\Enums;

enum CardType: string
{
   case SINGLE_COURSE = 'single_course';
   case BUNDLE = 'bundle';

   public function getLabel(): string
   {
      return match ($this) {
         self::SINGLE_COURSE => 'Single Course',
         self::BUNDLE => 'Bundle',
      };
   }
}
