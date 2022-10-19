import classNames from 'classnames';
import { ethers, Wallet } from 'ethers';
import { useCallback, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeGrid as Grid } from 'react-window';

function getMaxRepeatChar(str: string) {
  const subStr = str.slice(2);
  const chars = subStr.split('');
  const charsSet = new Set(chars);
  const numChar = charsSet.size;
  const numNumber = subStr.match(new RegExp('\\d', 'g'))!.length;
  let maxRepeatTimes = 0;
  let maxChar!: string;
  charsSet.forEach(char => {
    const repeatTimes = subStr.match(new RegExp(char, 'g'))!.length;
    if (maxRepeatTimes < repeatTimes) {
      maxRepeatTimes = repeatTimes;
      maxChar = char;
    }
  });
  return { maxChar, maxRepeatTimes, numChar, numNumber };
}

// @ts-ignore
const Row = ({ columnIndex, rowIndex, style, data }) => {
  const index = columnIndex + rowIndex * 6;
  return (
    <div
      style={style}
      title={data[index]?.wallet?.privateKey}
      className="text-base text-left"
    >
      <span
        className={classNames('px-1 font-mono', {
          'text-gray-300': data[index]?.maxRepeatTimes < 8,
          'text-red-300': data[index]?.maxRepeatTimes === 8,
          'bg-red-300 text-white': data[index]?.maxRepeatTimes === 9,
          'bg-red-600 text-white': data[index]?.maxRepeatTimes === 10,
          'bg-red-900 text-white': data[index]?.maxRepeatTimes >= 11,
        })}
      >
        {data[index]?.maxRepeatTimes}
      </span>
      <span className="font-mono">
        {data[index]?.wallet?.address.split('').map((v: string, i: number) => {
          const isSame = i >= 2 && v === data[index]?.maxChar;
          return (
            <span
              key={i}
              className={classNames({
                'text-green-600 font-normal': isSame,
                'text-gray-300': !isSame,
              })}
            >
              {v}
            </span>
          );
        })}
      </span>
      <br />
      <span className="text-xs text-gray-50">
        {data[index]?.wallet?.privateKey}
      </span>
    </div>
  );
};

export default function WalletCreator() {
  const [itemData, setItemData] = useState<
    {
      wallet: Wallet;
      maxChar: string;
      maxRepeatTimes: number;
      numNumber: number;
    }[]
  >([]);
  const onUpdateClick = useCallback(async () => {
    console.log('====================================');
    console.time('wallet');
    for (let i = 0; i < 10000; i++) {
      await new Promise(resolve => setTimeout(resolve));
      const wallet = ethers.Wallet.createRandom(); // 随机生成钱包，安全
      const { maxChar, maxRepeatTimes, numChar, numNumber } = getMaxRepeatChar(
        wallet.address
      );
      setItemData(prevState => [
        ...prevState,
        { wallet, maxChar, maxRepeatTimes, numChar, numNumber },
      ]);
    }
    console.timeEnd('wallet');
    console.log('====================================');
  }, []);

  return (
    <div className="w-full h-screen">
      <div className="p-2">
        <button
          type="button"
          onClick={onUpdateClick}
          className="py-2 px-3 text-sm font-medium text-gray-500 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-50 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Generate
        </button>
      </div>
      <div className="h-full">
        <AutoSizer>
          {({ height, width }) => (
            <Grid
              height={height}
              width={width}
              columnCount={5}
              columnWidth={500}
              rowCount={1000}
              rowHeight={36}
              itemData={itemData}
            >
              {Row}
            </Grid>
          )}
        </AutoSizer>
      </div>
    </div>
  );
}
