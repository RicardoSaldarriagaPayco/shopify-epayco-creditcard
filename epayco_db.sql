CREATE TABLE `Session` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shop` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isOnline` tinyint(1) NOT NULL DEFAULT '0',
  `scope` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires` datetime(3) DEFAULT NULL,
  `accessToken` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `Configuration` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sessionId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shop` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pCustId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `publicKey` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `privateKey` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pKey` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ready` tinyint(1) NOT NULL DEFAULT '1',
  `apiVersion` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unstable',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Configuration_sessionId_key` (`sessionId`),
  KEY `Configuration_sessionId_idx` (`sessionId`),
  CONSTRAINT `Configuration_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `Session` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `PaymentSession` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gid` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `group` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(65,30) NOT NULL,
  `test` tinyint(1) NOT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kind` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shop` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `paymentMethod` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `proposedAt` datetime(3) NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `clientDetails` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `merchantLocale` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `threeDSecureAuthentication` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `RefundSession` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gid` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `paymentId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(65,30) NOT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `proposedAt` datetime(3) NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `RefundSession_paymentId_fkey` (`paymentId`),
  CONSTRAINT `RefundSession_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `PaymentSession` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `CaptureSession` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gid` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `paymentId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(65,30) NOT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `proposedAt` datetime(3) NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `CaptureSession_paymentId_fkey` (`paymentId`),
  CONSTRAINT `CaptureSession_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `PaymentSession` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `VoidSession` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gid` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `paymentId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `proposedAt` datetime(3) NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `VoidSession_paymentId_key` (`paymentId`),
  CONSTRAINT `VoidSession_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `PaymentSession` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;