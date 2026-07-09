CREATE TABLE "OauthApplication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "metadata" TEXT,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT,
    "redirectUrls" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "authenticationScheme" TEXT,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OauthApplication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OauthAccessToken" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "accessTokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "refreshTokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "clientId" TEXT NOT NULL,
    "userId" TEXT,
    "scopes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OauthAccessToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OauthConsent" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scopes" TEXT NOT NULL,
    "consentGiven" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OauthConsent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Jwks" (
    "id" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "alg" TEXT,
    "crv" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Jwks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OauthApplication_clientId_key" ON "OauthApplication"("clientId");
CREATE INDEX "OauthApplication_userId_idx" ON "OauthApplication"("userId");

CREATE UNIQUE INDEX "OauthAccessToken_accessToken_key" ON "OauthAccessToken"("accessToken");
CREATE UNIQUE INDEX "OauthAccessToken_refreshToken_key" ON "OauthAccessToken"("refreshToken");
CREATE INDEX "OauthAccessToken_clientId_idx" ON "OauthAccessToken"("clientId");
CREATE INDEX "OauthAccessToken_userId_idx" ON "OauthAccessToken"("userId");

CREATE UNIQUE INDEX "OauthConsent_clientId_userId_key" ON "OauthConsent"("clientId", "userId");
CREATE INDEX "OauthConsent_clientId_idx" ON "OauthConsent"("clientId");
CREATE INDEX "OauthConsent_userId_idx" ON "OauthConsent"("userId");

ALTER TABLE "OauthApplication" ADD CONSTRAINT "OauthApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OauthAccessToken" ADD CONSTRAINT "OauthAccessToken_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "OauthApplication"("clientId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OauthAccessToken" ADD CONSTRAINT "OauthAccessToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OauthConsent" ADD CONSTRAINT "OauthConsent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "OauthApplication"("clientId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OauthConsent" ADD CONSTRAINT "OauthConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
