// Mock Escrow Provider for WorkBridge
// This simulates a real escrow service like Escrow.com or RazorpayX

export interface EscrowTransaction {
  id: string;
  amount: number;
  status: 'created' | 'funded' | 'released' | 'refunded' | 'failed';
  createdAt: Date;
  fundedAt?: Date;
  releasedAt?: Date;
  refundedAt?: Date;
  metadata: Record<string, any>;
}

class MockEscrowProvider {
  private transactions: Map<string, EscrowTransaction> = new Map();
  private webhookUrl: string;

  constructor(webhookUrl: string = '/api/webhooks/escrow') {
    this.webhookUrl = webhookUrl;
  }

  // Create an escrow account
  async createEscrow(amount: number, metadata: Record<string, any> = {}): Promise<{ escrowId: string; status: string }> {
    const escrowId = `ESC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const transaction: EscrowTransaction = {
      id: escrowId,
      amount,
      status: 'created',
      createdAt: new Date(),
      metadata
    };

    this.transactions.set(escrowId, transaction);

    // Simulate async processing
    setTimeout(() => {
      this.sendWebhook('escrow.created', { escrowId, amount, metadata });
    }, 100);

    return {
      escrowId,
      status: 'created'
    };
  }

  // Initiate payment into escrow (client pays)
  async initiatePayIn(escrowId: string): Promise<{ success: boolean; paymentUrl?: string }> {
    const transaction = this.transactions.get(escrowId);
    
    if (!transaction) {
      throw new Error('Escrow not found');
    }

    if (transaction.status !== 'created') {
      throw new Error(`Cannot initiate payin for escrow in status: ${transaction.status}`);
    }

    // Simulate payment processing delay
    setTimeout(() => {
      const updatedTransaction = this.transactions.get(escrowId);
      if (updatedTransaction) {
        updatedTransaction.status = 'funded';
        updatedTransaction.fundedAt = new Date();
        this.transactions.set(escrowId, updatedTransaction);
        
        this.sendWebhook('payin.success', {
          escrowId,
          amount: updatedTransaction.amount,
          fundedAt: updatedTransaction.fundedAt
        });
      }
    }, 2000); // 2 second delay to simulate real payment processing

    return {
      success: true,
      paymentUrl: `https://mock-payment-gateway.com/pay/${escrowId}` // Mock payment URL
    };
  }

  // Release funds to freelancer
  async releaseFunds(escrowId: string, amount?: number): Promise<{ success: boolean; transactionId: string }> {
    const transaction = this.transactions.get(escrowId);
    
    if (!transaction) {
      throw new Error('Escrow not found');
    }

    if (transaction.status !== 'funded') {
      throw new Error(`Cannot release funds for escrow in status: ${transaction.status}`);
    }

    const releaseAmount = amount || transaction.amount;
    
    if (releaseAmount > transaction.amount) {
      throw new Error('Release amount cannot exceed escrow amount');
    }

    // Calculate platform fee (5%)
    const platformFee = releaseAmount * 0.05;
    const freelancerAmount = releaseAmount - platformFee;

    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update transaction
    transaction.status = 'released';
    transaction.releasedAt = new Date();
    this.transactions.set(escrowId, transaction);

    // Simulate processing delay
    setTimeout(() => {
      this.sendWebhook('payout.success', {
        escrowId,
        transactionId,
        totalAmount: releaseAmount,
        freelancerAmount,
        platformFee,
        releasedAt: transaction.releasedAt
      });
    }, 1500);

    return {
      success: true,
      transactionId
    };
  }

  // Initiate refund to client
  async initiateRefund(escrowId: string, amount?: number, reason?: string): Promise<{ success: boolean; refundId: string }> {
    const transaction = this.transactions.get(escrowId);
    
    if (!transaction) {
      throw new Error('Escrow not found');
    }

    if (transaction.status !== 'funded') {
      throw new Error(`Cannot refund escrow in status: ${transaction.status}`);
    }

    const refundAmount = amount || transaction.amount;
    
    if (refundAmount > transaction.amount) {
      throw new Error('Refund amount cannot exceed escrow amount');
    }

    const refundId = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update transaction
    transaction.status = 'refunded';
    transaction.refundedAt = new Date();
    this.transactions.set(escrowId, transaction);

    // Simulate processing delay
    setTimeout(() => {
      this.sendWebhook('refund.success', {
        escrowId,
        refundId,
        amount: refundAmount,
        reason,
        refundedAt: transaction.refundedAt
      });
    }, 1000);

    return {
      success: true,
      refundId
    };
  }

  // Get escrow status
  async getEscrowStatus(escrowId: string): Promise<EscrowTransaction> {
    const transaction = this.transactions.get(escrowId);
    
    if (!transaction) {
      throw new Error('Escrow not found');
    }

    return transaction;
  }

  // Private method to send webhooks
  private async sendWebhook(eventType: string, data: any) {
    try {
      const webhookPayload = {
        event: eventType,
        data,
        timestamp: new Date().toISOString(),
        signature: this.generateSignature(eventType, data) // Mock signature
      };

      // In a real implementation, this would be an HTTP POST to the webhook URL
      // For now, we'll just log it and trigger our webhook handler directly
      console.log('📢 Mock Escrow Webhook:', webhookPayload);

      // Trigger our webhook handler
      if (typeof window === 'undefined') { // Server-side only
        const response = await fetch(`http://localhost:3000${this.webhookUrl}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': webhookPayload.signature
          },
          body: JSON.stringify(webhookPayload)
        });

        if (!response.ok) {
          console.error('Webhook delivery failed:', response.status);
        }
      }
    } catch (error) {
      console.error('Webhook error:', error);
    }
  }

  // Generate mock signature for webhook verification
  private generateSignature(eventType: string, data: any): string {
    const payload = JSON.stringify({ event: eventType, data });
    // In real implementation, this would be HMAC-SHA256 with secret key
    return `sha256=${Buffer.from(payload).toString('base64').slice(0, 32)}`;
  }

  // Simulate payment failures (for testing)
  async simulatePaymentFailure(escrowId: string, reason: string = 'Insufficient funds') {
    const transaction = this.transactions.get(escrowId);
    
    if (transaction) {
      transaction.status = 'failed';
      this.transactions.set(escrowId, transaction);
      
      this.sendWebhook('payin.failed', {
        escrowId,
        reason,
        failedAt: new Date()
      });
    }
  }

  // Get all transactions (for admin/debugging)
  getAllTransactions(): EscrowTransaction[] {
    return Array.from(this.transactions.values());
  }
}

// Singleton instance
export const mockEscrowProvider = new MockEscrowProvider();

// Helper functions for easier usage
export const escrowService = {
  createEscrow: (amount: number, milestoneId: string, projectId: string) => 
    mockEscrowProvider.createEscrow(amount, { milestoneId, projectId }),
  
  fundEscrow: (escrowId: string) => 
    mockEscrowProvider.initiatePayIn(escrowId),
  
  releaseToFreelancer: (escrowId: string, amount?: number) => 
    mockEscrowProvider.releaseFunds(escrowId, amount),
  
  refundToClient: (escrowId: string, amount?: number, reason?: string) => 
    mockEscrowProvider.initiateRefund(escrowId, amount, reason),
  
  getStatus: (escrowId: string) => 
    mockEscrowProvider.getEscrowStatus(escrowId)
};