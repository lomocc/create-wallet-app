import classNames from 'classnames';
import { ethers, Wallet } from 'ethers';
import { orderBy } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface WalletPrettyFragment {
  char: string;
}
interface WalletSerialFragment {
  start: number;
  end: number;
  length: number;
}
interface WalletContainFragment {
  char: string;
  times: number;
}
interface WalletRepeatFragment {
  char: string;
  times: number;
  start: number;
  end: number;
}

// @ts-ignore
const WalletRenderer = ({ wallet }: { wallet: Wallet }) => {
  // 靓号
  const isPretty = useMemo(
    () =>
      ['1314520', '65536', 'dead', 'DEAD', '622848', '22631'].some(char =>
        wallet.address.includes(char)
      ),
    [wallet]
  );
  const isUppercase = useMemo(
    () => /^0x[0-9A-F]+$/.test(wallet.address),
    [wallet]
  );
  const isLowercase = useMemo(
    () => /^0x[0-9a-f]+$/.test(wallet.address),
    [wallet]
  );
  // contains
  const containChars = useMemo(() => {
    const str = wallet.address.slice(2);
    const chars = str.split('');
    const charsSet = new Set(chars);
    const containChars: WalletContainFragment[] = [];
    charsSet.forEach(char => {
      const containTimes = str.match(new RegExp(char, 'g'))!.length;
      containChars.push({
        char,
        times: containTimes,
      });
    });
    return orderBy(containChars, ['times'], ['desc']);
  }, [wallet]);
  const repeatChars = useMemo(() => {
    const str = wallet.address.slice(2);
    const repeatChars: WalletRepeatFragment[] = [];
    str.match(/(.)\1{1,}/g)?.forEach((repeatChar: string) => {
      const startIndex = str.indexOf(repeatChar);
      repeatChars.push({
        char: repeatChar[0],
        times: repeatChar.length,
        start: startIndex,
        end: startIndex + repeatChar.length,
      });
    });
    return orderBy(repeatChars, ['times'], ['desc']);
  }, [wallet]);
  const serialChars = useMemo(() => {
    const str = wallet.address.slice(2);
    const serialChars: WalletSerialFragment[] = [];
    str
      .match(/(?:a(?=b)|b(?=c)|c(?=d)|d(?=e)|e(?=f)){4,}\w/gi)
      ?.forEach((serialChar: string) => {
        const startIndex = str.indexOf(serialChar);
        serialChars.push({
          start: startIndex,
          end: startIndex + serialChar.length,
          length: serialChar.length,
        });
      });
    str
      .match(
        /(?:0(?=1)|1(?=2)|2(?=3)|3(?=4)|4(?=5)|5(?=6)|6(?=7)|7(?=8)|8(?=9)){4,}\d/g
      )
      ?.forEach((serialChar: string) => {
        const startIndex = str.indexOf(serialChar);
        serialChars.push({
          start: startIndex,
          end: startIndex + serialChar.length,
          length: serialChar.length,
        });
      });
    return orderBy(serialChars, ['length'], ['desc']);
  }, [wallet]);

  return (
    <details className="px-2 py-1 relative group open:bg-blue-100 rounded-t">
      <summary
        className={classNames(
          'font-mono text-sm',
          isPretty || isUppercase || isLowercase
            ? 'text-gray-500'
            : 'text-gray-200',
          {
            'bg-pink-200': isPretty,
            'bg-purple-200': isUppercase,
            'bg-amber-200': isLowercase,
          }
        )}
      >
        {wallet.address
          .slice(2)
          .split('')
          .map((v: string, i: number) => {
            const isSerial = serialChars.some(
              val => i >= val.start && i < val.end
            );
            const isRepeat = repeatChars.some(
              val => i >= val.start && i < val.end
            );
            const colors = ['text-green-600', 'text-blue-600'];
            const targetIndex = containChars.findIndex(val => val.char === v);
            const isContainChar = targetIndex != -1;
            return (
              <span
                key={i}
                className={classNames('inline-block', {
                  [`${colors[targetIndex] ?? ''} font-medium`]: isContainChar,
                  'text-gray-600': isRepeat,
                  'underline decoration-pink-500': isSerial,
                })}
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
      <div className="w-full text-amber-600 text-sm font-mono break-words whitespace-pre-wrap rounded-b p-2 z-10 bg-blue-50 absolute left-0">
        {wallet.privateKey}
      </div>
    </details>
  );
};
export default function WalletCreator() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  useEffect(() => {
    let animationFrameId: number;
    const onAnimationFrame = () => {
      const wallet = ethers.Wallet.createRandom(); // 随机生成钱包，安全
      setWallets(prevState => [...prevState, wallet]);
      animationFrameId = requestAnimationFrame(onAnimationFrame);
    };
    if (isRunning) {
      animationFrameId = requestAnimationFrame(onAnimationFrame);
    }
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning]);

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
            checked={isRunning}
            onChange={event => setIsRunning(event.target.checked)}
          />
          <span className="ml-2">Running</span>
        </label>
        <button
          type="button"
          onClick={onClearClick}
          className="py-2 px-3 text-sm font-medium text-gray-500 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-50 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-600 select-none"
        >
          Clear
        </button>
      </div>
      <div className="max-h-full overflow-auto flex flex-wrap">
        {wallets.map((wallet, i) => (
          <WalletRenderer wallet={wallet} key={i} />
        ))}
      </div>
    </div>
  );
}
