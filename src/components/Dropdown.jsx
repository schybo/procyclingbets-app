import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ArchiveBoxIcon, ChevronDownIcon, EllipsisVerticalIcon, EyeIcon, TrashIcon } from '@heroicons/react/20/solid'
import { useIonRouter } from '@ionic/react'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Dropdown({ race, deleteRace, archiveToggle }) {
    const router = useIonRouter();

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
            <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                <Menu.Item>
                    {({ active }) => (
                        <button
                            onClick={() =>
                                router.push(
                                    `/race/view/${race.id}`,
                                    "forward",
                                    "replace"
                                )
                            }
                            className={classNames(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'block px-4 py-2 text-sm flex flex-row items-center'
                            )}
                        >
                            <EyeIcon className='mr-2 h-4'></EyeIcon>
                            <span>View</span>
                        </button>
                    )}
                </Menu.Item>
                <Menu.Item>
                    {({ active }) => (
                    <button
                        onClick={() => deleteRace(race.id)}
                        className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 text-sm flex flex-row items-center'
                        )}
                    >
                        <TrashIcon className='mr-2 h-4'></TrashIcon>
                        Delete
                    </button>
                    )}
                </Menu.Item>
                </div>
                <div className="py-1">
                <Menu.Item>
                    {({ active }) => (
                    <button
                        onClick={() => archiveToggle(race)}
                        className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 text-sm flex flex-row items-center'
                        )}
                    >
                        <ArchiveBoxIcon className='mr-2 h-4'></ArchiveBoxIcon>
                        { race.archived ? "Unarchive" : "Archive" }
                    </button>
                    )}
                </Menu.Item>
                </div>
            </Menu.Items>
            </Transition>
        </Menu>
    )
}
