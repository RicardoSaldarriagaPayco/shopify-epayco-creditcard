-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `isOnline` BOOLEAN NOT NULL DEFAULT false,
    `scope` VARCHAR(191) NULL,
    `expires` DATETIME(3) NULL,
    `accessToken` VARCHAR(191) NOT NULL,
    `userId` BIGINT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shopify_tdc_capturesession` (
    `id` VARCHAR(191) NOT NULL,
    `gid` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `proposedAt` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NULL,

    INDEX `CaptureSessionShopify_paymentId_fkey`(`paymentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shopify_tdc_configurationshopify` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionId` VARCHAR(191) NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `pCustId` VARCHAR(191) NOT NULL,
    `publicKey` VARCHAR(191) NOT NULL,
    `privateKey` VARCHAR(191) NOT NULL,
    `pKey` VARCHAR(191) NOT NULL,
    `ready` BOOLEAN NOT NULL DEFAULT true,
    `apiVersion` VARCHAR(191) NOT NULL DEFAULT 'unstable',

    UNIQUE INDEX `ConfigurationShopify_sessionId_key`(`sessionId`),
    INDEX `ConfigurationShopify_sessionId_idx`(`sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shopify_tdc_paymentsession` (
    `id` VARCHAR(191) NOT NULL,
    `gid` VARCHAR(191) NOT NULL,
    `group` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `test` BOOLEAN NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `customer` VARCHAR(191) NOT NULL,
    `proposedAt` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NULL,
    `clientDetails` VARCHAR(191) NULL,
    `merchantLocale` VARCHAR(191) NULL,
    `threeDSecureAuthentication` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shopify_tdc_refundsession` (
    `id` VARCHAR(191) NOT NULL,
    `gid` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `proposedAt` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NULL,

    INDEX `RefundSessionShopify_paymentId_fkey`(`paymentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shopify_tdc_voidsession` (
    `id` VARCHAR(191) NOT NULL,
    `gid` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NOT NULL,
    `proposedAt` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NULL,

    UNIQUE INDEX `VoidSessionShopify_paymentId_key`(`paymentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `shopify_tdc_capturesession` ADD CONSTRAINT `CaptureSessionShopify_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `shopify_tdc_paymentsession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shopify_tdc_configurationshopify` ADD CONSTRAINT `ConfigurationShopify_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `Session`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shopify_tdc_refundsession` ADD CONSTRAINT `RefundSessionShopify_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `shopify_tdc_paymentsession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shopify_tdc_voidsession` ADD CONSTRAINT `VoidSessionShopify_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `shopify_tdc_paymentsession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

