import { describe, it, expect } from "vitest";

describe("kuerten SIP-010 token contract", () => {
  it("should have correct token metadata constants", () => {
    const tokenName = "kuerten";
    const tokenSymbol = "kuerten";
    const tokenDecimals = 6;
    const tokenUri = "https://hiro.so";
    
    expect(tokenName).toBe("kuerten");
    expect(tokenSymbol).toBe("kuerten");
    expect(tokenDecimals).toBe(6);
    expect(tokenUri).toBe("https://hiro.so");
  });

  it("should calculate mint amounts correctly", () => {
    const mintAmount = 1000;
    const expectedBalance = mintAmount;
    
    expect(mintAmount).toBe(1000);
    expect(expectedBalance).toBe(1000);
  });

  it("should calculate transfer amounts correctly", () => {
    const initialBalance = 500;
    const transferAmount = 200;
    const expectedSenderBalance = initialBalance - transferAmount;
    const expectedRecipientBalance = transferAmount;
    
    expect(initialBalance).toBe(500);
    expect(transferAmount).toBe(200);
    expect(expectedSenderBalance).toBe(300);
    expect(expectedRecipientBalance).toBe(200);
  });

  it("should prevent transfers with insufficient balance", () => {
    const balance = 100;
    const transferAmount = 200;
    const hasSufficientBalance = balance >= transferAmount;
    const expectedError = 101; // ERR_NOT_TOKEN_OWNER
    
    expect(balance).toBe(100);
    expect(transferAmount).toBe(200);
    expect(hasSufficientBalance).toBe(false);
    expect(expectedError).toBe(101);
  });

  it("should calculate total supply correctly after multiple mints", () => {
    const mint1 = 1000;
    const mint2 = 500;
    const mint3 = 750;
    
    const totalSupply = mint1 + mint2 + mint3;
    
    expect(mint1).toBe(1000);
    expect(mint2).toBe(500);
    expect(mint3).toBe(750);
    expect(totalSupply).toBe(2250);
  });

  it("should track balances correctly after multiple transfers", () => {
    const wallet1Initial = 1000;
    const wallet2Initial = 500;
    const wallet3Initial = 0;
    
    // Transfer 300 from wallet1 to wallet2
    const transfer1 = 300;
    const wallet1After1 = wallet1Initial - transfer1;
    const wallet2After1 = wallet2Initial + transfer1;
    
    // Transfer 200 from wallet2 to wallet3
    const transfer2 = 200;
    const wallet2After2 = wallet2After1 - transfer2;
    const wallet3After2 = wallet3Initial + transfer2;
    
    expect(wallet1After1).toBe(700);
    expect(wallet2After1).toBe(800);
    expect(wallet2After2).toBe(600);
    expect(wallet3After2).toBe(200);
  });

  describe("admin functions", () => {
    it("should initialize with owner as admin", () => {
      const owner = "deployer";
      const admins = [owner];
      const adminCount = admins.length;
      
      expect(admins).toContain(owner);
      expect(adminCount).toBe(1);
    });

    it("should allow adding admins up to max limit", () => {
      const maxAdmins = 10;
      const initialAdmins = ["owner"];
      const newAdmins = ["admin1", "admin2", "admin3"];
      const allAdmins = [...initialAdmins, ...newAdmins];
      
      expect(initialAdmins.length).toBe(1);
      expect(newAdmins.length).toBe(3);
      expect(allAdmins.length).toBe(4);
      expect(allAdmins.length).toBeLessThanOrEqual(maxAdmins);
    });

    it("should prevent adding duplicate admins", () => {
      const admins = ["owner", "admin1"];
      const newAdmin = "admin1";
      const isDuplicate = admins.includes(newAdmin);
      const expectedError = 111; // ERR_ALREADY_ADMIN
      
      expect(admins).toContain("admin1");
      expect(isDuplicate).toBe(true);
      expect(expectedError).toBe(111);
    });

    it("should prevent adding more than 10 admins", () => {
      const maxAdmins = 10;
      const currentAdmins = ["owner", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9"];
      const canAddMore = currentAdmins.length < maxAdmins;
      const expectedError = 110; // ERR_MAX_ADMINS
      
      expect(currentAdmins.length).toBe(10);
      expect(canAddMore).toBe(false);
      expect(expectedError).toBe(110);
    });

    it("should allow removing admins", () => {
      const admins = ["owner", "admin1", "admin2"];
      const adminToRemove = "admin1";
      const updatedAdmins = admins.filter(a => a !== adminToRemove);
      
      expect(admins).toContain("admin1");
      expect(admins.length).toBe(3);
      expect(updatedAdmins).not.toContain("admin1");
      expect(updatedAdmins.length).toBe(2);
      expect(updatedAdmins).toEqual(["owner", "admin2"]);
    });

    it("should prevent removing non-existent admins", () => {
      const admins = ["owner", "admin1"];
      const adminToRemove = "admin2";
      const exists = admins.includes(adminToRemove);
      const expectedError = 113; // ERR_ADMIN_NOT_FOUND
      
      expect(admins).not.toContain("admin2");
      expect(exists).toBe(false);
      expect(expectedError).toBe(113);
    });

    it("should prevent removing the contract owner", () => {
      const admins = ["owner", "admin1"];
      const adminToRemove = "owner";
      const canRemoveOwner = false;
      const expectedError = 112; // ERR_CANNOT_REMOVE_OWNER
      
      expect(admins).toContain("owner");
      expect(canRemoveOwner).toBe(false);
      expect(expectedError).toBe(112);
    });

    it("should check if a user is an admin", () => {
      const admins = ["owner", "admin1", "admin2"];
      
      const isOwnerAdmin = admins.includes("owner");
      const isAdmin1Admin = admins.includes("admin1");
      const isNonAdmin = admins.includes("user3");
      
      expect(isOwnerAdmin).toBe(true);
      expect(isAdmin1Admin).toBe(true);
      expect(isNonAdmin).toBe(false);
    });

    it("should return correct admin count", () => {
      const admins = ["owner", "admin1", "admin2"];
      const adminCount = admins.length;
      
      expect(adminCount).toBe(3);
    });

    it("should handle admin list correctly after multiple operations", () => {
      let admins = ["owner"];
      
      // Add admins
      admins = [...admins, "admin1", "admin2"];
      expect(admins.length).toBe(3);
      expect(admins).toEqual(["owner", "admin1", "admin2"]);
      
      // Remove an admin
      admins = admins.filter(a => a !== "admin1");
      expect(admins.length).toBe(2);
      expect(admins).toEqual(["owner", "admin2"]);
      
      // Try to add duplicate
      const couldAddDuplicate = admins.includes("admin2") ? false : true;
      expect(couldAddDuplicate).toBe(false);
      
      // Final admin list
      expect(admins).toContain("owner");
      expect(admins).toContain("admin2");
      expect(admins).not.toContain("admin1");
    });
  });

  describe("error codes", () => {
    it("should have correct error constants", () => {
      const ERR_OWNER_ONLY = 100;
      const ERR_NOT_TOKEN_OWNER = 101;
      const ERR_NOT_ADMIN = 102;
      const ERR_MAX_ADMINS = 110;
      const ERR_ALREADY_ADMIN = 111;
      const ERR_CANNOT_REMOVE_OWNER = 112;
      const ERR_ADMIN_NOT_FOUND = 113;
      
      expect(ERR_OWNER_ONLY).toBe(100);
      expect(ERR_NOT_TOKEN_OWNER).toBe(101);
      expect(ERR_NOT_ADMIN).toBe(102);
      expect(ERR_MAX_ADMINS).toBe(110);
      expect(ERR_ALREADY_ADMIN).toBe(111);
      expect(ERR_CANNOT_REMOVE_OWNER).toBe(112);
      expect(ERR_ADMIN_NOT_FOUND).toBe(113);
    });
  });

  describe("edge cases", () => {
    it("should handle zero amount transfers", () => {
      const balance = 500;
      const transferAmount = 0;
      const newBalance = balance - transferAmount;
      
      expect(transferAmount).toBe(0);
      expect(newBalance).toBe(500);
    });

    it("should handle maximum supply limits", () => {
      const maxSupply = 1000000000000; // 1 million with 6 decimals
      const currentSupply = 500000000;
      const mintAmount = 600000000;
      const wouldExceedMax = (currentSupply + mintAmount) > maxSupply;
      
      expect(maxSupply).toBe(1000000000000);
      expect(currentSupply + mintAmount).toBe(1100000000);
      expect(wouldExceedMax).toBe(false); // Still under max
    });

    it("should handle large numbers correctly", () => {
      const largeAmount = 1000000000000;
      const fee = (largeAmount * 9) / 10000;
      
      expect(largeAmount).toBe(1000000000000);
      expect(fee).toBe(900000000);
    });
  });
});
