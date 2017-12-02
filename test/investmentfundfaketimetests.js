const InvestmentFund = artifacts.require('./InvestmentFundFakeTime.sol');

const DEFAULT_DAYS_FOR_WITHDRAWAL = 14
const DAYS_IN_FUTURE_BEFORE_DEADLINE = DEFAULT_DAYS_FOR_WITHDRAWAL - 2;
const DAYS_IN_FUTURE_AFTER_DEADLINE = DEFAULT_DAYS_FOR_WITHDRAWAL + 2
const DEPOSITED_MONEY = 154;
const WITHDRAWN_MONEY = 10;
const BIG_WITHDRAWAL = DEPOSITED_MONEY + (DEPOSITED_MONEY * 2);

contract(`InvestmendFund with ${DEFAULT_DAYS_FOR_WITHDRAWAL} days withdrawal limit`, () => {
  let investmentFund;

  beforeEach(async () => {
    investmentFund = await InvestmentFund.new(DEFAULT_DAYS_FOR_WITHDRAWAL);
  });

  context(`Can deposit and withdraw amount of money`, () => {
    let depositResult;
    let balanceAfterOperation;
    let transferEvent;

    beforeEach(async () => {
      depositResult = await investmentFund.deposit(DEPOSITED_MONEY);
      transferEvent = depositResult.logs[0];
      balanceAfterOperation = await investmentFund.getMyBalance.call();
    });

    it('Transfer event emitted', async () => {
      assert.ok(transferEvent);
      assert.ok(transferEvent.event);
      assert.equal(transferEvent.event, 'Transfer');
    });

    it('Transfer event value equals sent amount', async () => {
      assert.ok(transferEvent.args._value);
      assert.equal(transferEvent.args._value, DEPOSITED_MONEY);
    });

    it('Account balance is correct', async () => {
      assert.ok(balanceAfterOperation);
      assert.equal(balanceAfterOperation, DEPOSITED_MONEY);
    });

    context(`Can withdraw money from account after ${DAYS_IN_FUTURE_BEFORE_DEADLINE} days from first deposit`, async () => {
      let withdrawResult;
      let firstDepositTime;
      let currentTime;

      beforeEach(async () => {
        await investmentFund.setCurrentTime(addDaysToDate(new Date(), DAYS_IN_FUTURE_BEFORE_DEADLINE));
        withdrawResult = await investmentFund.withdraw(WITHDRAWN_MONEY);
        transferEvent = withdrawResult.logs[0];
        balanceAfterOperation = await investmentFund.getMyBalance.call();
      });

      it('Transfer event emitted', async () => {
        assert.ok(transferEvent);
        assert.ok(transferEvent.event);
        assert.equal(transferEvent.event, 'Transfer');
      });

      it('Transfer event value equals sent amount', async () => {
        assert.ok(transferEvent.args._value);
        assert.equal(transferEvent.args._value, WITHDRAWN_MONEY);
      });

      it('Account balance is correct', async () => {
        assert.ok(balanceAfterOperation);
        assert.equal(balanceAfterOperation, DEPOSITED_MONEY - WITHDRAWN_MONEY);
      });
    });

    context(`Cannot withdraw money from account after ${DAYS_IN_FUTURE_AFTER_DEADLINE} days from first deposit`, async () => {
      let withdrawResult;

      beforeEach(async () => {
        await investmentFund.setCurrentTime(addDaysToDate(new Date(), DAYS_IN_FUTURE_AFTER_DEADLINE));
        withdrawResult = investmentFund.withdraw(WITHDRAWN_MONEY);
      });

      it('Operation returns error', async () => {
        assertInvalidOpCode(withdrawResult);
      });
    });

    context(`Cannot withdraw negative amount of money`, async () => {
      let lessThanZeroWithdrawal;

      beforeEach(async () => {
        await investmentFund.setCurrentTime(addDaysToDate(new Date(), DAYS_IN_FUTURE_AFTER_DEADLINE));
        lessThanZeroWithdrawal = investmentFund.withdraw(-1);
      });

      it('Operation returns error', async () => {
        assertInvalidOpCode(lessThanZeroWithdrawal);
      });
    });

    context(`Cannot withdraw more than in account`, async () => {
      let moreThanInAccountWithdrawal;

      beforeEach(async () => {
        await investmentFund.setCurrentTime(addDaysToDate(new Date(), DAYS_IN_FUTURE_AFTER_DEADLINE));
        moreThanInAccountWithdrawal = investmentFund.withdraw(BIG_WITHDRAWAL);
      });

      it('Operation returns error', async () => {
        assertInvalidOpCode(moreThanInAccountWithdrawal);
      });
    });
  });
});

async function assertInvalidOpCode(promise) {
  try {
    await promise;
  } catch (error) {
    assert.isAbove(error.message.search('invalid opcode'), -1, 'Invalid opcode error must be returned');
  }
}

function addDaysToDate(date, days) {
  return Math.floor(new Date(date.getTime() + days * 24 * 60 * 60 * 1000) / 1000);
}