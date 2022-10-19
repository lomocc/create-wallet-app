import { Heap } from '@datastructures-js/heap';
import classNames from 'classnames';
import { ethers, Wallet } from 'ethers';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface WalletRepeatFragment {
  char: string;
  times: number;
}
interface WalletSerialFragment {
  start: number;
  end: number;
}
interface WalletContainFragment {
  char: string;
  times: number;
}

// @ts-ignore
const WalletRenderer = ({ wallet }: { wallet: Wallet }) => {
  const containChars = useMemo(() => {
    const str = wallet.address.slice(2);
    const chars = str.split('');
    const charsSet = new Set(chars);
    const containChars = new Heap<WalletContainFragment>((a, b) => {
      // with least price
      return b.times - a.times;
    });
    charsSet.forEach(char => {
      const containTimes = str.match(new RegExp(char, 'g'))!.length;
      containChars.push({
        char,
        times: containTimes,
      });
    });
    return [containChars.extractRoot(), containChars.extractRoot()];
  }, [wallet]);
  return (
    <details className="px-2 py-1 even:bg-gray-50 odd:bg-white overflow-auto">
      <summary className="font-mono text-sm">
        {wallet.address.split('').map((v: string, i: number) => {
          const colors = ['text-green-600', 'text-yellow-600'];
          const targetIndex = containChars.findIndex(val => val.char === v);
          const isSame = i >= 2 && targetIndex !== -1;
          return (
            <span
              key={i}
              className={classNames(
                'inline-block',
                isSame && isSame
                  ? `${colors[targetIndex]} font-medium `
                  : 'text-gray-300'
              )}
            >
              {v}
            </span>
          );
        })}
        <span
          className={classNames('ml-1', {
            'text-red-100': containChars[0].times < 8,
            'bg-red-200 text-white': containChars[0].times === 8,
            'bg-red-300 text-white': containChars[0].times === 9,
            'bg-red-500 text-white': containChars[0].times === 10,
            'bg-red-700 text-white': containChars[0].times >= 11,
          })}
        >
          {containChars[0].times}
        </span>
      </summary>
      <div className="w-full text-amber-600 text-sm font-mono break-words whitespace-pre-wrap">
        {wallet.privateKey}
      </div>
    </details>
  );
};

export default function WalletCreator() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const isRunningRef = useRef(true);
  const shouldClearRef = useRef(false);
  isRunningRef.current = isRunning;
  useEffect(() => {
    const createWallet = async () => {
      if (isRunningRef.current) {
        await new Promise(resolve => setTimeout(resolve));
        const wallet = ethers.Wallet.createRandom(); // 随机生成钱包，安全
        const shouldClear = shouldClearRef.current;
        shouldClearRef.current = false;
        setWallets(prevState =>
          shouldClear ? [wallet] : [...prevState, wallet]
        );
      }
    };
    createWallet();
  });
  const onClearClick = useCallback(() => {
    alert(123);
    shouldClearRef.current = true;
  }, []);

  return (
    <div className="w-full h-screen space-y-2 overflow-auto">
      {shouldClearRef.current ? 1 : 0}
      <div className="p-2 flex space-x-2 sticky top-0 bg-gray-50 z-10">
        <button
          type="button"
          onClick={() => setIsRunning(v => !v)}
          className="py-2 px-3 text-sm font-medium text-gray-500 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-50 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-600 select-none"
        >
          {isRunning ? 'Pause' : 'Resume'}
        </button>
        <button
          type="button"
          onClick={onClearClick}
          className="py-2 px-3 text-sm font-medium text-gray-500 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-50 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-600 select-none"
        >
          clear
        </button>
      </div>
      <div className="h-full">
        {wallets.map((wallet, i) => (
          <WalletRenderer wallet={wallet} key={i} />
        ))}
      </div>
    </div>
  );
}
