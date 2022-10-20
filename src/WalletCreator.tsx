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
    <details className="px-2 py-1 even:bg-gray-50 odd:bg-white">
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
            'bg-red-400 text-white': containChars[0].times === 9,
            'bg-red-600 text-white': containChars[0].times === 10,
            'bg-red-900 text-white': containChars[0].times === 11,
            'bg-black text-white': containChars[0].times >= 12,
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
  // const [isRunning, setIsRunning] = useState(true);
  const isRunningRef = useRef<HTMLInputElement>(null);

  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const onAnimationFrame = () => {
      if (isRunningRef.current?.checked) {
        const wallet = ethers.Wallet.createRandom(); // 随机生成钱包，安全
        setWallets(prevState => [...prevState, wallet]);
      }
      animationFrameRef.current = requestAnimationFrame(onAnimationFrame);
    };
    animationFrameRef.current = requestAnimationFrame(onAnimationFrame);
    return () => {
      cancelAnimationFrame(animationFrameRef.current!);
    };
  });

  const onClearClick = useCallback(() => {
    setWallets([]);
  }, []);

  return (
    <div className="w-full h-screen flex flex-col gap-2">
      <div className="p-2 border-b border-gray-100 flex-shrink-0 flex space-x-2 sticky top-0 bg-gray-50 z-10">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox rounded text-pink-500"
            ref={isRunningRef}
          />
          <span className="ml-2">Running</span>
        </label>
        {/* <button
          type="button"
          onClick={() => setIsRunning(v => !v)}
          className="py-2 px-3 text-sm font-medium text-gray-500 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-50 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-600 select-none"
        >
          {isRunning ? 'Pause' : 'Resume'}
        </button> */}
        <button
          type="button"
          onClick={onClearClick}
          className="py-2 px-3 text-sm font-medium text-gray-500 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-50 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-600 select-none"
        >
          Clear
        </button>
      </div>
      <div className="p-2 flex-auto overflow-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {wallets.map((wallet, i) => (
          <WalletRenderer wallet={wallet} key={i} />
        ))}
      </div>
    </div>
  );
}
